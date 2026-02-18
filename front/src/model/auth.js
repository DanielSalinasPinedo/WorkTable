import axios from 'axios';

const URL = "https://10.20.2.170:3030"

export const LoginRequest = async (values) => await axios.post(`${URL}/login`, values);