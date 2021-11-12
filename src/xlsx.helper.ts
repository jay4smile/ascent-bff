import { utils, read, WorkSheet } from 'xlsx';

/* eslint-disable @typescript-eslint/naming-convention */

function ec(r: number, c: number) {
    return utils.encode_cell({r:r, c:c});
}

export class XLSXHelper {

    // Read a xlsx file
    read = read

    utils = utils
    
    // delete a specific row
    delete_row(ws: WorkSheet, row_index: number){
        if (ws["!ref"]) {
            const variable = utils.decode_range(ws["!ref"])
            for(let R = row_index; R < variable.e.r; ++R){
                for(let C = variable.s.c; C <= variable.e.c; ++C){
                    ws[ec(R, C)] = ws[ec(R+1, C)];
                }
            }
            variable.e.r--
            ws['!ref'] = utils.encode_range(variable.s, variable.e);
        }
    }

}