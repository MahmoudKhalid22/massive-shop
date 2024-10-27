// dropboxUploader.ts
import * as fs from "fs";
import { FileInfo, DropboxConfig, UploadOptions, UploadResult } from "./types";
import { generateAvatar } from "./avatarGenerator";

import { DropboxService } from "../../config/DropboxService";
import { AvatarOptions } from "./avatarGenerator";

export class AvatarUploader {
  /**
   * Generate and upload avatar
   */
  public dbx: DropboxService;
  constructor() {
    this.dbx = DropboxService.getInstance();
  }
  public async generateAndUploadAvatar(
    userName: string,
    avatarOptions: AvatarOptions = {},
    uploadOptions: UploadOptions = { makePublic: true, overwrite: true },
  ): Promise<UploadResult> {
    try {
      const avatarPath = await generateAvatar(userName, avatarOptions);

      try {
        const result = await this.dbx.uploadFile(
          avatarPath,
          "/avatars",
          uploadOptions,
        );

        return result;
      } finally {
        // Clean up local file regardless of upload success/failure
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
    } catch (error: any) {
      if (error instanceof Error) {
        throw new Error(`Avatar generation/upload failed: ${error.message}`);
      }
      throw new Error("Unknown error during avatar generation/upload");
    }
  }
}
