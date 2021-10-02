type uploadFormParams = {
  file: File;
  lang: string;
};

export const uploadFile = async ({ file, lang }: uploadFormParams) => {
  const data = new FormData();
  data.append("file", file);
  data.append("lang", lang);

  return fetch(`${process.env.REACT_APP_BACKEND_ENDPOINT}/cgi-bin/result.py`, {
    method: "post",
    body: data,
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      return error;
    });
};
