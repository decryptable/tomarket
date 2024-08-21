const userLogin = async (init_data) => {
  const raw_body = JSON.stringify({
    init_data,
    invite_code: "",
    from: "",
    is_bot: false,
  });

  try {
    const response = await fetch(
      "https://api-web.tomarket.ai/tomarket-game/v1/user/login",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: raw_body,
      }
    );

    const data = await response.json();

    const status = data.status;

    if (status !== 0) {
      return {
        error: true,
        message: data.message,
      };
    }

    return {
      error: false,
      tel_id: data.data.tel_id,
      id: data.data.id,
      fn: data.data.fn,
      ln: data.data.ln,
      access_token: data.data.access_token,
      photo_url: data.data.photo_url,
      is_kol: data.data.is_kol,
    };
  } catch (error) {
    return {
      error: true,
      message: error.toString(),
    };
  }
};

export default userLogin;
