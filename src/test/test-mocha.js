
import axios from 'axios'
import { expect } from 'chai'
import { request } from 'express'
import supertest from 'supertest'

const requestWithSupertest = supertest('http://localhost:8080')
const testProduct = {
    product: 'Lapiz color',
    price: 12.20,
    stock: 47,
    description: 'Lápiz para pintar',
    code: '123F',
    thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/pencil-pen-stationery-school-64.png'
}

describe('TEST API RESTFull', () => {
    describe('1-SERVIDOR EN MARCHA', () => {
        it('Deberia retornar status 200', async () => {
            const response = await requestWithSupertest.get('/')
            expect(response.status).to.eql(200)
        })
    })
    describe('2-TEST CRUD', () => {
        it('Deberia agregar un producto', async () => {
            const productsBeforeAdd = await requestWithSupertest.get('/api/productos/arrayproductos')
            const response = await requestWithSupertest.post('/api/productos').send(testProduct)
            expect(response.status).to.eql(200)
            testProduct.id = response.body._id
            const productsAfterAdd = await requestWithSupertest.get('/api/productos/arrayproductos')
            expect(productsBeforeAdd.body.length + 1).to.eql(productsAfterAdd.body.length)
        })
        it('Deberia listar todos los productos', async () => {
            const response = await requestWithSupertest.get('/api/productos/arrayproductos')
            expect(response.status).to.eql(200)
        })
        it('Deberia listar un producto por su ID', async () => {
            const response = await requestWithSupertest.get(`/api/productos/${testProduct.id}`)
            expect(response.status).to.eql(200)
        })
        it('Deberia actualizar un producto', async () => {
            const infoToUpdate = {
                product: 'Lápiz color rojo',
                stock: 1500
            }
            const response = await requestWithSupertest.put(`/api/productos/${testProduct.id}`).send(infoToUpdate)
            expect(response.status).to.eql(200)
            expect(response.body.product).to.eql(infoToUpdate.product)
            expect(response.body.stock).to.eql(infoToUpdate.stock)
        })
        it('Deberia eliminar un producto por su ID', async () => {
            const response = await requestWithSupertest.delete(`/api/productos/${testProduct.id}`)
            expect(response.status).to.eql(200)
        })
    })
})