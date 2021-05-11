import {RequestHandler} from 'express-serve-static-core';

export type FileUploadHandler = RequestHandler;

export interface File {
    mimetype: string,
    buffer: Buffer,
    size: number,
    fieldname: string,
    name: string
}
