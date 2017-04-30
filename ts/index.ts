
import { IConfig } from "./specs/IConfig";

const request = require('request')

const defaultConfig = {
  username: process.env.DICOM_USERNAME,
  password: process.env.DICOM_PASSWORD,
  token: process.env.DICOM_TOKEN,
  baseUrl: process.env.DICOM_BASEURL||'http://api.godicom.com/sandbox/ws/external/shipping'
}

// const urls = {
//   api_create_shipment_url: process.env.API_CREATE_SHIPMENT_URL || 'https://api1.dicom.com/uni-sandbox/shipment',
//   api_create_pickup_url: process.env.API_CREATE_PICKUP_URL || 'http://api.godicom.com/sandbox/ws/external/shipping/pickup',
//   api_generate_manifest_url: process.env.API_MANIFEST_URL || 'http://api.godicom.com/sandbox/ws/external/shipping/pickup/{id}/manifests',
//   api_generate_waybill_url: process.env.API_GENERATE_WAYBILL_URL || 'http://api.godicom.com/sandbox/ws/external/shipping/shipment/{id}/waybills?format=4x5',
// }

  

export default class DicomAPI {
  
  static config:IConfig = defaultConfig
  static authorization:string

  constructor(config?:IConfig){
    if(config){
      Object.assign(DicomAPI.config,config);
    }

    DicomAPI.authorization = 'Basic ' + Buffer.from(DicomAPI.config.username + ':' + DicomAPI.config.password).toString('base64');  
  }

  createPickup(data:Object, callback:(error:any,id:string|number,response:any) => void){
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
        url: `${DicomAPI.config.baseUrl}${path}`,
        method: 'GET',
        headers: {
          'Authorization': DicomAPI.authorization,
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
          url: `${DicomAPI.config.baseUrl}${path}`,
          method: 'POST',
          headers: {
            'Authorization': DicomAPI.authorization,
            'accept': 'application/json',
            'content-type': 'application/json'
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