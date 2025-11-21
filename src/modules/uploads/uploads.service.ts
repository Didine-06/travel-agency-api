import { Injectable } from '@nestjs/common';
import { ApiResponse, ErrorResponse } from '../../common/helpers';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File) {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      const fileUrl = `/uploads/${fileName}`;

      return ApiResponse({
        fileName,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      return ErrorResponse('UPLOAD_FAILED');
    }
  }

  async deleteFile(fileName: string) {
    try {
      const filePath = path.join(this.uploadDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return ApiResponse({ message: 'File deleted successfully' });
      }

      return ErrorResponse('FILE_NOT_FOUND');
    } catch (error) {
      return ErrorResponse('DELETE_FAILED');
    }
  }
}
