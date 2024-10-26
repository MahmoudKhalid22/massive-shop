// dropboxUploader.ts
import { Dropbox, DropboxResponse, files } from "dropbox";
import * as fs from "fs";
import * as path from "path";
import {
  FileInfo,
  DropboxConfig,
  UploadOptions,
  UploadResult,
} from "./../utils/media//types";
// import { generateAvatar } from "./avatarGenerator";
export class DropboxService {
  private dbx: Dropbox;
  private static instance: DropboxService;

  constructor() {
    this.dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });
  }
  public static getInstance(): DropboxService {
    if (!DropboxService.instance) {
      DropboxService.instance = new DropboxService();
    }
    return DropboxService.instance;
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
   * Upload a file to Dropbox
   */

  public async uploadFile(
    filePath: string,
    dropboxPath: string,
    options: UploadOptions = { makePublic: true, overwrite: true },
  ): Promise<UploadResult> {
    try {
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
