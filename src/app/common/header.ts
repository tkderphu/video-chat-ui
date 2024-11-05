import { HttpHeaders } from "@angular/common/http";
import { Utils } from "./utils";


export class Header {

    public static header() {
        const header = new HttpHeaders()
        .set("Authorization", "UUID " + Utils.getPayload().uuid)
        .set('Content-Type', 'application/json; charset=utf-8')
        return header;
    }

}
