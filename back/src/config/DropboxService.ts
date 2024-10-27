import { Dropbox, files } from "dropbox";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import {
  FileInfo,
  DropboxConfig,
  UploadOptions,
  UploadResult,
} from "./../utils/media//types";

export class DropboxService {
  private dbx: Dropbox;
  private static instance: DropboxService;
  private accessToken: string;
  private accessTokenExpiresAt: Date | null = null;

  constructor() {
    this.accessToken = ""; // Initially empty, will be set dynamically
    this.dbx = new Dropbox({ accessToken: this.accessToken });
  }

  public static getInstance(): DropboxService {
    if (!DropboxService.instance) {
      DropboxService.instance = new DropboxService();
    }
    return DropboxService.instance;
  }

  /**
   * Ensure a valid access token by refreshing it if necessary
   */
  private async ensureAccessToken(): Promise<void> {
    if (!this.accessToken || this.isAccessTokenExpired()) {
      console.log("Access token expired or missing. Refreshing...");
      await this.refreshAccessToken();
      this.dbx = new Dropbox({ accessToken: this.accessToken });
    }
  }

  /**
   * Refresh the Dropbox access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post(
        "https://api.dropbox.com/oauth2/token",
        null,
        {
          params: {
            grant_type: "refresh_token",
            refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
            client_id: process.env.DROPBOX_CLIENT_ID,
            client_secret: process.env.DROPBOX_CLIENT_SECRET,
          },
        },
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // after 4 h
        this.accessTokenExpiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
        console.log("Access token successfully refreshed.");
      } else {
        throw new Error("Failed to refresh access token.");
      }
    } catch (error: any) {
      throw new Error(`Error refreshing access token: ${error.message}`);
    }
  }

  /**
   * Placeholder to check if the access token is expired.
   */
  private isAccessTokenExpired(): boolean {
    return this.accessTokenExpiresAt
      ? Date.now() >= this.accessTokenExpiresAt.getTime()
      : true;
  }

  /**
   * Upload a file to Dropbox
   */
  public async uploadFile(
    filePath: string,
    dropboxPath: string,
    options: UploadOptions = { makePublic: true, overwrite: true },
  ): Promise<UploadResult> {
    try {
      await this.ensureAccessToken(); // Ensure we have a valid access token

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileContent: Buffer = fs.readFileSync(filePath);
      const fileName: string = path.basename(filePath);
      const normalizedPath: string = this.normalizePath(dropboxPath, fileName);

      const uploadResponse = await this.dbx.filesUpload({
        path: normalizedPath,
        contents: fileContent,
        mode: options.overwrite ? { ".tag": "overwrite" } : { ".tag": "add" },
        strict_conflict: false,
      });

      let shareLink: string = "";

      const shareResponse = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.path_display || "",
      });
      shareLink = shareResponse.result.url;

      return {
        fileInfo: {
          id: uploadResponse.result.id,
          name: uploadResponse.result.name,
          path_display:
            uploadResponse.result.path_display ||
            uploadResponse.result.path_lower ||
            uploadResponse.result.name,
          size: uploadResponse.result.size,
          server_modified: uploadResponse.result.server_modified,
        },
        shareLink,
      };
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Delete a file from Dropbox
   */
  public async deleteFile(dropboxPath: string): Promise<FileInfo> {
    try {
      await this.ensureAccessToken(); // Ensure we have a valid access token

      const response = await this.dbx.filesDelete({
        path: this.normalizePath(dropboxPath),
      });

      if (!this.isFile(response.result)) {
        throw new Error("Deleted item was not a file");
      }

      return this.convertToFileInfo(response.result);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * List files in a Dropbox folder
   */
  public async listFiles(folderPath: string = ""): Promise<FileInfo[]> {
    try {
      await this.ensureAccessToken(); // Ensure we have a valid access token

      const response = await this.dbx.filesListFolder({
        path: this.normalizePath(folderPath),
        recursive: false,
        include_deleted: false,
        include_mounted_folders: false,
        include_non_downloadable_files: false,
      });

      return response.result.entries
        .filter(this.isFile)
        .map(this.convertToFileInfo.bind(this));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Type guard to check if metadata is a file
   */
  private isFile(
    entry:
      | files.FileMetadataReference
      | files.FolderMetadataReference
      | files.DeletedMetadataReference,
  ): entry is files.FileMetadataReference {
    return entry[".tag"] === "file";
  }

  /**
   * Convert Dropbox metadata to FileInfo
   */
  private convertToFileInfo(metadata: files.FileMetadataReference): FileInfo {
    return {
      id: metadata.id,
      name: metadata.name,
      path_display:
        metadata.path_display || metadata.path_lower || metadata.name,
      size: metadata.size,
      server_modified: metadata.server_modified,
    };
  }

  /**
   * Handle API errors with improved type checking
   */
  private handleError(error: any): never {
    if (error?.response?.status === 409) {
      throw new Error("File already exists in Dropbox");
    }
    if (error?.response?.status === 401) {
      throw new Error("Invalid access token or authentication failed");
    }
    if (error?.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later");
    }
    throw new Error(
      `Dropbox operation failed: ${error.message || "Unknown error"}`,
    );
  }

  /**
   * Normalize Dropbox path
   */
  private normalizePath(dropboxPath: string, fileName?: string): string {
    let normalizedPath = dropboxPath.startsWith("/")
      ? dropboxPath
      : `/${dropboxPath}`;
    if (fileName) {
      normalizedPath = `${normalizedPath}/${fileName}`;
    }
    return normalizedPath;
  }
}

export default DropboxService;
