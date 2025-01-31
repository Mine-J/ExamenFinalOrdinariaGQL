import { ObjectId } from "mongodb";

export type restaurantesModel = {

    _id:ObjectId,
    nombre:string,
    direccion:string,
    ciudad:string,
    telefono:string,
    timezone:string,
    lat:string,
    lon:string
}