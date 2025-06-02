
import { 
    GOOGLE_API_KEY, 
    GOOGLE_CLIENT_ID, 
    GOOGLE_API_DISCOVERY_DOCS, 
    GOOGLE_API_SCOPES,
    GOOGLE_DRIVE_BACKUP_FILENAME,
    TIMEKEEPER_CALENDAR_NAME
} from '../constants';

declare global {
  interface Window {
    gapi: any; // Google API client
  }
}

let gapiAuthChangeCallback: ((isSignedIn: boolean) => void) | null = null;

/**
 * Initializes the Google API client.
 * This function should be called after the GAPI script has loaded.
 * @param onAuthChange Callback function to be invoked when authentication state changes.
 */
export const initGoogleApiClient = async (onAuthChange: (isSignedIn: boolean) => void): Promise<boolean> => {
  if (!window.gapi || !window.gapi.client) {
    console.error("GAPI client not loaded yet.");
    return false;
  }
  
  gapiAuthChangeCallback = onAuthChange;

  try {
    await window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      clientId: GOOGLE_CLIENT_ID,
      discoveryDocs: GOOGLE_API_DISCOVERY_DOCS,
      scope: GOOGLE_API_SCOPES,
    });
    
    // Load Calendar API explicitly after client init if not covered by discoveryDocs, though discoveryDocs should handle it.
    // await window.gapi.client.load('calendar', 'v3'); // Usually not needed if in discoveryDocs

    // Listen for sign-in state changes.
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle the initial sign-in state.
    updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    return true;
  } catch (error: any) {
    console.error('Error initializing Google API client: ', error);
    if (error.details) {
        console.error('Details:', error.details);
    }
    return false;
  }
};

/**
 * Updates the sign-in status and calls the registered callback.
 * @param isSignedIn True if the user is signed in, false otherwise.
 */
const updateSigninStatus = (isSignedIn: boolean) => {
  if (gapiAuthChangeCallback) {
    gapiAuthChangeCallback(isSignedIn);
  }
};

/**
 * Initiates the Google Sign-In flow.
 */
export const signInToGoogle = (): Promise<any> => {
  if (window.gapi && window.gapi.auth2) {
    return window.gapi.auth2.getAuthInstance().signIn();
  }
  return Promise.reject(new Error("GAPI auth2 not initialized for sign in."));
};

/**
 * Signs the current user out.
 */
export const signOutFromGoogle = () => {
  if (window.gapi && window.gapi.auth2 && window.gapi.auth2.getAuthInstance()) {
    window.gapi.auth2.getAuthInstance().signOut();
  } else {
    console.warn("GAPI auth2 not initialized or no user signed in for sign out.");
  }
};

/**
 * Checks if the user is currently signed in to Google.
 */
export const isGoogleUserSignedIn = (): boolean => {
  return window.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get() || false;
};

// Drive Specific Functions
const findFileInAppDataFolder = async (): Promise<string | null> => {
  if (!isGoogleUserSignedIn() || !window.gapi.client.drive) {
    return null;
  }
  try {
    const response = await window.gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'files(id, name)',
      pageSize: 10
    });
    const files = response.result.files;
    if (files && files.length > 0) {
      const backupFile = files.find((file: any) => file.name === GOOGLE_DRIVE_BACKUP_FILENAME);
      return backupFile ? backupFile.id : null;
    }
    return null;
  } catch (error) {
    console.error("Error finding file in AppDataFolder: ", error);
    return null;
  }
};

export const uploadToDrive = async (content: string): Promise<{success: boolean, message?: string}> => {
  if (!isGoogleUserSignedIn() || !window.gapi.client.drive) {
    return { success: false, message: "Drive API not ready or user not signed in." };
  }
  const fileId = await findFileInAppDataFolder();
  const metadata: any = {
    name: GOOGLE_DRIVE_BACKUP_FILENAME,
    mimeType: 'application/json',
  };
  if (!fileId) { 
    metadata.parents = ['appDataFolder'];
  }
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
  const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      close_delim;
  const path = fileId ? `/upload/drive/v3/files/${fileId}` : '/upload/drive/v3/files';
  try {
    await window.gapi.client.request({
      path: path,
      method: fileId ? 'PATCH' : 'POST',
      params: { uploadType: 'multipart' },
      headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
      body: multipartRequestBody
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error uploading to Drive: ", error);
    return { success: false, message: error?.result?.error?.message || "Upload failed." };
  }
};

export const downloadFromDrive = async (): Promise<string | null> => {
  if (!isGoogleUserSignedIn() || !window.gapi.client.drive) {
    return null;
  }
  const fileId = await findFileInAppDataFolder();
  if (!fileId) {
    return null; 
  }
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    return response.body;
  } catch (error: any) {
    console.error("Error downloading from Drive: ", error);
    return null;
  }
};

// Calendar Specific Functions
/**
 * Lists the user's calendars.
 * @returns A promise that resolves with the list of calendars or null on error.
 */
export const listCalendars = async (): Promise<any[] | null> => {
  if (!isGoogleUserSignedIn() || !window.gapi.client.calendar) {
    console.warn("Calendar API not ready or user not signed in for listing calendars.");
    return null;
  }
  try {
    const response = await window.gapi.client.calendar.calendarList.list();
    return response.result.items;
  } catch (error) {
    console.error("Error listing calendars: ", error);
    return null;
  }
};

/**
 * Creates a new calendar.
 * @param summary The name for the new calendar.
 * @returns A promise that resolves with the created calendar object or null on error.
 */
export const createCalendar = async (summary: string): Promise<any | null> => {
  if (!isGoogleUserSignedIn() || !window.gapi.client.calendar) {
    console.warn("Calendar API not ready or user not signed in for creating calendar.");
    return null;
  }
  try {
    const response = await window.gapi.client.calendar.calendars.insert({
      resource: { summary: summary }
    });
    return response.result;
  } catch (error) {
    console.error("Error creating calendar: ", error);
    return null;
  }
};

/**
 * Creates an event on the specified calendar.
 * @param calendarId The ID of the calendar to add the event to.
 * @param event The event resource object.
 * @returns A promise that resolves with the created event object or null on error.
 */
export const createCalendarEvent = async (calendarId: string, event: any): Promise<any | null> => {
  if (!isGoogleUserSignedIn() || !window.gapi.client.calendar) {
    console.warn("Calendar API not ready or user not signed in for creating event.");
    return null;
  }
  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: calendarId,
      resource: event
    });
    return response.result;
  } catch (error) {
    console.error("Error creating calendar event: ", error);
    return null;
  }
};
