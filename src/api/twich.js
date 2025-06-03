const TWITCH_CLIENT_ID = 'qm4twglzq6xu883c8ftlafc6vgegid';
const TWITCH_CLIENT_SECRET = 'x3ih0y36wubs36dajexzdpzmg1ub6s';
let accessToken = null;

async function getAccessToken() {
  if (accessToken) return accessToken;

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
  return accessToken;
}

export async function getMLBBStreams() {
  const token = await getAccessToken();
  const response = await fetch(
    'https://api.twitch.tv/helix/streams?game_id=494184&first=100', 
    {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  return data.data || [];
}

export async function getChannelVideos(channelLogin) {
  const token = await getAccessToken();
  
  // Получаем ID канала по логину
  const userResponse = await fetch(
    `https://api.twitch.tv/helix/users?login=${channelLogin}`,
    {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const userData = await userResponse.json();
  if (!userData.data || userData.data.length === 0) return [];
  
  const userId = userData.data[0].id;
  
  // Получаем видео канала
  const videosResponse = await fetch(
    `https://api.twitch.tv/helix/videos?user_id=${userId}&first=5&sort=time&type=archive`,
    {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const videosData = await videosResponse.json();
  return videosData.data || [];
}