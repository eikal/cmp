
/* eslint-disable */import chai from 'chai';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import server from '../index.mjs';
import HttpCodes from '../../../shared/http-status-codes.js';
dotenv.config();
const should = chai.should();

chai.use(chaiHttp);
describe('Login API', function () {
    it('Should return successful login', function (done) {
        chai.request(server)
            .post('/login')
            .send({
                username: process.env.LDAP_USER,
                password: process.env.LDAP_PASSWORD
            })
            .end(function (err, res) {
                res.should.have.status(HttpCodes.OK);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('statusCode');
                res.body.should.have.property('message');
                done();
            });
    });

    it('Should return failed login', function (done) {
        chai.request(server)
            .post('/login')
            .send({
                username: '123',
                password: '456'
            })
            .end(function (err, res) {
                res.should.have.status(HttpCodes.UNAUTHORIZE);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('statusCode');
                res.body.should.have.property('message');
                done();
            });
    });
});
