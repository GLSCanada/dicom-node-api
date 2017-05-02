
import { IConfig } from "./specs/IConfig";

const request = require('request')

const defaultConfig = {
  username: process.env.DICOM_USERNAME,
  password: process.env.DICOM_PASSWORD,
  token: process.env.DICOM_TOKEN,
  baseUrl: process.env.DICOM_BASEURL||'http://api.godicom.com/sandbox/ws/external/shipping'
} 


// const request = async function (body) {
//   return new Promise((resolve, reject) => {
//     oldrequest(body, (error, response, body) => {
//       if (error) reject(error)
//       else resolve(body)
//     })
//   }
//   )

//todo check to change for async/await

export default class DicomAPI {
  
  private config:IConfig
  private basicAuth:string

  constructor(config?:IConfig){
    if(config){
      Object.assign(this.config,config);
    }

    this.basicAuth = 'Basic ' + Buffer.from(this.config.username + ':' + this.config.password).toString('base64');  
  }

  createPickup(data:Object, callback:(error:any, id:string|number, response:any) => void){
    const path = '/pickup'
    this.post(path, data, callback)
  }

  createShipment(data:Object, callback:(error:any,id:string|number,response:any) => void){
    const path = '/shipment'
    this.post(path, data, callback)
  }

  getWaybill(id:number|string, format:string='4x5', callback:(error:any,response:any) => void){
    const path = `shipment/${id}/waybills?format=${format}`
    this.getDoc(path, id, callback)
  }

  getManifest(id:number|string, callback:(error:any,response:any) => void){
    const path = `/pickup/${id}/manifests`
    this.getDoc(path, id, callback)
  }

  getDoc(path:string, id:number|string, callback:(error:any,response:any) => void){
      if(!id){
        throw new Error("id is required")
      }

      const options = {
        url: `${this.config.baseUrl}${path}`,
        method: 'GET',
        headers: {
          'Authorization': this.basicAuth,
          'accept': 'application/pdf',
          'content-type': 'application/json'
        },
        encoding: null
      }

      request(options, (error, response) => {
        callback(error, response.body)
      })
  }

  post(path:string, data:Object, callback:(error:any, id:number|string, response:any)=>void){

        const options = {
          url: `${this.config.baseUrl}${path}`,
          method: 'POST',
          headers: {
            'Authorization': this.basicAuth,
            'accept': 'application/json',
            'content-type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.config.token
          },
          body: data,
          json: true
      }

      request(options, (error, response) => {
        if (!error && response.statusCode == 201) {
          const url = response.headers.location
          const fragUrl = url.split('/')
          const id = fragUrl[fragUrl.length - 1]
          callback(null, id, response.body)
        } else {
          callback(response.body, null, null)
        }
      })
  }
}