import { files } from "dropbox";

export interface FileInfo {
  id: string;
  name: string;
  path_display: string;
  size: number;
  server_modified: string;
}

export interface DropboxConfig {
  accessToken: string;
}

export interface UploadOptions {
  makePublic?: boolean;
  overwrite?: boolean;
}

export interface UploadResult {
  fileInfo: FileInfo;
  shareLink: string;
}
