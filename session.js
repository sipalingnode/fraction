import axios from "axios";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getSessions = async (getlogin) => {
    console.log(`wait 30 detik`);
    await delay(30000);
    try {
        const getSessions = await axios.get(`https://dapp-backend-large.fractionai.xyz/api3/session-types/live-paginated/user/${getlogin.user.id}?pageSize=10&pageNumber=1&status=live`, { headers: { Accept: 'application/json' } });
        const sessions = getSessions.data;
        return sessions.sessions.sessions;
    } catch (error) {
        return error.message
    }
}

export default getSessions
