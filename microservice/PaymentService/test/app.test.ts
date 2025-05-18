import {test, beforeAll, afterAll, beforeEach, vi} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import * as authService from '../src/auth/service'
import  db from './db'
import app from '../src/app'

const validDriver = {
  name: "Driver 1",
  email: "driver1@outlook.com",
  picture: "https://www.google.com/image",
  sub: "12345677",
}
const driver3 = {
  
}