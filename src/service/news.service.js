import http from "../service/http-common";

class NewsDataService {
    getAll() {
        return http.get("/app/index.aspx?cmd=home2");
    }
    getInfoCate(cateid) {
        return http.get(`/api/v3/content?cmd=id&id=${cateid}&tb=categories`);
    }
    getBannerName(name) {
        return http.get(`/app/index.aspx?cmd=adv&pos=${name}`);
    }
    get(id) {
        return http.get(`/tutorials/${id}`);
    }
    getNewsIdCate(id, q = "") {
        return http.get(`/api/gl/select2?cmd=art&includeSource=1&channels=${id}&q=${q}`)
    }
    getNewsNameCate(id) {
        return http.get(`/api/gl/select2?cmd=art&includeSource=1&channelTitle=${id}`)
    }
    getDetailNew(id) {
        return http.get(`/api/v3/article?cmd=get&ids=${id}`);
    }
    getListCate(id) {
        return http.get(`/api/gl/select2?cmd=cate&app=article&roots=${id}&ignore_pid0=1`);
    }
}

export default new NewsDataService();