import { Collection,ObjectId } from "mongodb";
import { restaurantesModel } from "./types.ts";



type context = {
    restaurantesCollection:Collection<restaurantesModel>
}
export const resolvers = {

    restaurante: {

        id:(parent:restaurantesModel):string => {
            return parent._id.toString();
        },
        direccion:async(parent:restaurantesModel):Promise<string> => {
            const api_key = Deno.env.get("API_KEY");
            const responseCiudad = await fetch('https://api.api-ninjas.com/v1/country?name=' + parent.ciudad,{headers: {'X-Api-Key': api_key}});
            if (!responseCiudad.ok) {
            throw new Error(`ResponseTelefono status: ${responseCiudad.status}`);
            }

            const jsonCiudad = await responseCiudad.json();
            
            return `${parent.direccion}, ${parent.ciudad}, ${jsonCiudad[0].name}`
        },
        
        temperatura:async(parent:restaurantesModel):Promise<string> => {
            const api_key = Deno.env.get("API_KEY");
            const responseClima = await fetch(`https://api.api-ninjas.com/v1/weather?lat=${parent.lat}&&lon=${parent.lon}`,{headers: {'X-Api-Key': api_key}});
            if (!responseClima.ok) {
            throw new Error(`ResponseTelefono status: ${responseClima.status}`);
            }

            const jsonClima = await responseClima.json();
            return `${jsonClima.temp}`
        },
        hora:async(parent:restaurantesModel):Promise<string> => {

            const api_key = Deno.env.get("API_KEY");
            const responseHora = await fetch('https://api.api-ninjas.com/v1/worldtime?timezone=' + parent.timezone,{headers: {'X-Api-Key': api_key}});
            if (!responseHora.ok) {
            throw new Error(`ResponseTelefono status: ${responseHora.status}`);
            }

            const jsonHora = await responseHora.json();


            return `${jsonHora.hour}:${jsonHora.minute}`
        }
    },

    Query: {
        

        getRestaurant:async(
            _:unknown,
            {id}:{id:string},
            ctx:context
        ):Promise<restaurantesModel> => {

            const restaurante = await ctx.restaurantesCollection.findOne({_id:new ObjectId(id)})
            if(!restaurante)
            {
                throw new Error("El restaurante con ese id no existe");
            }
            return restaurante;
        },

        getRestaurants:async(
            _:unknown,
            {ciudad}:{ciudad:string},
            ctx:context
        ):Promise<restaurantesModel[]> => {

            const restaurante = await ctx.restaurantesCollection.find({ciudad:ciudad}).toArray();
            if(!restaurante)
            {
                throw new Error("No hay restaurantes con esa ciudad");
            }
            return restaurante;
        },
    },

    Mutation: {


        deleteRestaurant:async(
            _:unknown,
            {id}:{id:string},
            ctx:context
        ):Promise<boolean> => {

            const restaurante = await ctx.restaurantesCollection.deleteOne({_id:new ObjectId(id)});
            if(restaurante.deletedCount === 0)
            {
                return false;
            }else{
                return true;
            }
        },

        addRestaurant:async(
            _:unknown,
            {nombre,direccion,ciudad,telefono}:{nombre:string,direccion:string,ciudad:string,telefono:string},
            ctx:context
        ):Promise<restaurantesModel> => {
            const api_key = Deno.env.get("API_KEY");
            const responseTelefono = await fetch('https://api.api-ninjas.com/v1/validatephone?number=' + telefono,{headers: {'X-Api-Key': api_key}});
            if (!responseTelefono.ok) {
            throw new Error(`ResponseTelefono status: ${responseTelefono.status}`);
            }

            const jsonTelefono = await responseTelefono.json();
            if(!jsonTelefono.is_valid)
            {
                throw new Error("El número introducido no es valido")
            }


            const existeTelefono = await ctx.restaurantesCollection.findOne({telefono:telefono})
            if(existeTelefono)
            {
                throw new Error("Ya hay un restaurante con ese numero de telefono")
            }


            const responseLatLon = await fetch('https://api.api-ninjas.com/v1/city?name=' + ciudad,{headers: {'X-Api-Key': api_key}});
            if (!responseLatLon.ok) {
            throw new Error(`ResponseTelefono status: ${responseLatLon.status}`);
            }

            const jsonLatLon = await responseLatLon.json();


            const responseTimeZone = await fetch(`https://api.api-ninjas.com/v1/timezone?lat=${jsonLatLon[0].latitude}&&lon=${jsonLatLon[0].longitude}`,{headers: {'X-Api-Key': api_key}});
            if (!responseTimeZone.ok) {
            throw new Error(`ResponseTelefono status: ${responseTimeZone.status}`);
            }


            const jsonTimezone = await responseTimeZone.json();
            const restaurante:restaurantesModel = {
              _id: new ObjectId(),
              nombre: nombre,
              direccion: direccion,
              ciudad: ciudad,
              telefono: telefono,
              timezone: jsonTimezone.timezone,
              lat: jsonLatLon[0].latitude,
              lon: jsonLatLon[0].longitude
            }
            const agregado = await ctx.restaurantesCollection.insertOne(restaurante);
            if(!agregado)
            {
                throw new Error("No se ha podido agregar el restaurante")
            }
            return restaurante;
        },
        
        
    }

}