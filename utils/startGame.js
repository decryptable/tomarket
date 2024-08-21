const startGame = async (auth_token) => {
  try {
    const response = await fetch(
      "https://api-web.tomarket.ai/tomarket-game/v1/game/play",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth_token,
        },
        method: "POST",
        body: JSON.stringify({
          game_id: "59bcd12e-04e2-404c-a172-311a0084587d",
        }),
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
      round_id: data.data.round_id,
      user_id: data.data.user_id,
      start_at: data.data.start_at,
      end_at: data.data.end_at,
    };
  } catch (error) {
    return {
      error: true,
      message: error.toString(),
    };
  }
};

export default startGame;
