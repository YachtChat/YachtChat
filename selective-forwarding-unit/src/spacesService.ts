import axios from 'axios';

const SPACES_URL: string | undefined = process.env.SPACES_URL
const SPACES_SSL: string | undefined = process.env.SPACES_SSL

const spaces_url: string = SPACES_SSL! + SPACES_URL! + '/api/v1/spaces/'

export async function isUserAllowedToJoinSpace(spaceId: string, token: string){
    const response = await axios.get(spaces_url + spaceId + '/canUserJoin/', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    return response.data.valid
}
