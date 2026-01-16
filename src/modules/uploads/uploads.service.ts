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

  /**
   * Upload a file to a specific subdirectory
   * @param file The file to upload
   * @param subDirectory The subdirectory (e.g., 'flight-tickets', 'profiles')
   */
  async uploadFile(file: Express.Multer.File, subDirectory: string = 'general') {
    try {
      // Create subdirectory if it doesn't exist
      const targetDir = path.join(this.uploadDir, subDirectory);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileNameWithoutExt = path.basename(file.originalname, fileExtension);
      const uniqueFileName = `${Date.now()}-${fileNameWithoutExt}${fileExtension}`;
      const filePath = path.join(targetDir, uniqueFileName);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      // Return relative URL path
      const fileUrl = `/uploads/${subDirectory}/${uniqueFileName}`;

      return ApiResponse({
        fileName: uniqueFileName,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      return ErrorResponse('UPLOAD_FAILED');
    }
  }

  /**
   * Delete a file from a subdirectory
   * @param fileUrl The file URL (e.g., '/uploads/flight-tickets/123-file.pdf')
   */
  async deleteFile(fileUrl: string) {
    try {
      // Extract path from URL
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const filePath = path.join(this.uploadDir, relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return ApiResponse({ message: 'File deleted successfully' });
      }

      return ErrorResponse('FILE_NOT_FOUND');
    } catch (error) {
      return ErrorResponse('DELETE_FAILED');
    }
  }

  /**
   * Get file stream for serving
   * @param fileUrl The file URL
   */
  getFileStream(fileUrl: string): { stream: fs.ReadStream; mimeType: string } | null {
    try {
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const filePath = path.join(this.uploadDir, relativePath);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stream = fs.createReadStream(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      // Determine MIME type based on extension
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      return { stream, mimeType };
    } catch (error) {
      return null;
    }
  }
}
