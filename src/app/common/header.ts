import { HttpHeaders } from "@angular/common/http";
import { Utils } from "./utils";


export class Header {

    public static header() {
        console.log(Utils.getPayload())
        const header = new HttpHeaders()
        .set("Authorization", "UUID " + Utils.getPayload().uuid)
        .set('Content-Type', 'application/json; charset=utf-8')
        console.log("Author: ", header.get("Authorization"))
        console.log("Content: ", header.get("Content-Type"))
        return header;
    }

}