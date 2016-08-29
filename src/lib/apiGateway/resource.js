import _ from 'lodash'
import Debug from 'debug'
import Promise from 'bluebird'

import {method} from './method'

const debug = Debug('aglex.apiGateway.resource')

export const resource = api => {
  const Method = method(api)

  class Resource {
    constructor (restApi, data) {
      this._restApi = restApi
      _.merge(this, data)
    }

    createMethod (params) {
      return Method.create(this, params)
    }

    delete () {
      return Promise.delay(250)
        .then(() => api.deleteResourceAsync({
          resourceId: this.id,
          restApiId: this._restApi.id
        }))
    }

    methods () {
      const methods = []
      let promise = Promise.resolve()

      _.forEach(this.resourceMethods, (dummy, method) => {
        promise = promise
          .then(() => Promise.delay(500))
          .then(() => api.getMethodAsync({
            httpMethod: method,
            resourceId: this.id,
            restApiId: this._restApi.id
          }))
          .then(data => {
            debug(data)
            methods.push(new Method(this, data))
          })
      })

      return promise.then(() => methods)
    }
  }

  Resource.create = (restApi, params) => {
    const obj = _.merge({
      restApiId: restApi.id
    }, params)

    return Promise.delay(250)
      .then(() => api.createResourceAsync(obj))
      .then(data => {
        debug(data)
        return new Resource(restApi, data)
      })
  }

  return Resource
}
