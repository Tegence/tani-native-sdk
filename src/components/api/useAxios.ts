import axios from 'axios';

const baseURL = 'https://api.usetani.ai/api/v0';

export default axios.create({
  baseURL: baseURL,
});
