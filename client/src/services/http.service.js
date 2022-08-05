import AxiosService from './axios.service';

class HttpService {
	static instance;
	axiosService;
	prefix = 'https://cors-anywhere.herokuapp.com/https://test-api.techsee.me/api/ex/all';

	constructor() {
		if (HttpService.instance) {
			return HttpService.instance;
		}
		HttpService.instance = this;
		this.axiosService = new AxiosService();
	}

	getExample = async () => {
		try {
			const response = await this.axiosService.get(this.prefix);
			return response;
		} catch (ex) {
			console.error(ex);
			throw ex;
		}
	};
}

export default HttpService;
