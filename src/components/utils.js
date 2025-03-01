import axios from 'axios';

export async function getVideo(sid, item, base64 = false, cancelToken = null) {
    const headers = {
        'Authorization': 'Token ' + process.env.VUE_APP_TOKEN.trim(),
        'Content-Type': 'application/json',
    };
    let data = {
        'name': item.name,
        'path': item.path,
        '_sid': sid,
        'progress': base64 ? item.sec : null,
    }
    try {
        const response = await axios.post(process.env.VUE_APP_BACKEND_URL + '/video/url/', data, { 
          headers,
          cancelToken,
        });
        return response.data.result;
    } catch (error) {
        console.log(error)
    }
}

export async function getSid() {
    try {
      const response = await axios.get(process.env.VUE_APP_BACKEND_URL + '/video/login/', {
        headers: {
          'Authorization': 'Token ' + process.env.VUE_APP_TOKEN.trim(),
          'Content-Type': 'application/json',
        }
      })
      return response.data.data.sid;
    } catch (error) {
      console.log(error)
    }
}