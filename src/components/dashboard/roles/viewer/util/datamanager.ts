const API_BASE_URL = 'http://localhost:3000/api/fastapi';

const fetchData = async (pathT: string, method: string = 'GET', contentType: string = 'application/json') => {
  const path = `${API_BASE_URL}/${pathT}`;

  return new Promise((resolve, reject) => {
    fetch(path, {
      method: method,
      headers: {
        'Content-Type': contentType
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      })
      .then((data) => {
        if (contentType === 'application/json') {
          resolve(data.json());
        } else {
          resolve(data);
        }
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation: ', error);
        reject(error);
      });
  });
};

export default { fetchData };
