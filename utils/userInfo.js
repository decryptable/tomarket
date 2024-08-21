const userInfo = async (auth_token) => {
  try {
    const response = await fetch(
      "https://api-web.tomarket.ai/tomarket-game/v1/user/balance",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth_token,
        },
        method: "POST",
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

    const farming_data = data.data.farming ?? {};
    const daily_data = data.data.daily ?? {};

    return {
      error: false,
      available_balance: data.data.available_balance,
      play_passes: data.data.play_passes,
      timestamp: data.data.timestamp,
      farming: {
        game_id: farming_data.game_id,
        round_id: farming_data.round_id,
        user_id: farming_data.user_id,
        start_at: farming_data.start_at,
        end_at: farming_data.end_at,
        last_claim: farming_data.last_claim,
        points: farming_data.points,
        finished: farming_data.finished,
        claim_this_time: farming_data.claim_this_time,
      },
      daily: {
        round_id: daily_data.round_id,
        user_id: daily_data.user_id,
        start_at: daily_data.start_at,
        last_check_ts: daily_data.last_check_ts,
        last_check_ymd: daily_data.last_check_ymd,
        next_check_ts: daily_data.next_check_ts,
        check_counter: daily_data.check_counter,
        today_points: daily_data.today_points,
        today_game: daily_data.today_game,
      },
    };
  } catch (error) {
    return {
      error: true,
      message: error.toString(),
    };
  }
};

export default userInfo;
