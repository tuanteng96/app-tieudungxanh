import React from "react";
import { SERVER_APP } from "./../../constants/config";
import ReactHtmlParser from "react-html-parser";
import NewsDataService from "../../service/news.service";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Subnavbar,
  Searchbar,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import NotificationIcon from "../../components/NotificationIcon";
import SkeletonNews from "../news/SkeletonNews";
import ShareMenu from "./components/ShareMenu";
import PageNoData from "../../components/PageNoData";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      list: [],
      data: [],
      loading: true,
      active: null,
      page: null,
      showPreloader: false,
      isLoading: true,
      value: "",
    };
  }

  componentDidMount() {
    this.getShares();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.active !== this.state.active) {
      this.getListShares();
    }
  }

  getShares = async () => {
    let { data } = await NewsDataService.getListCate("901");
    let newData = data?.data
      ? data?.data.map((x) => ({
          ...x,
          text: x.id !== 901 ? x.text : "Tất cả",
        }))
      : [];
    this.setState({
      loading: false,
      data: newData,
      active: newData && newData.length > 0 ? newData[0].id : null,
      page: data?.data && data?.data.length > 0 ? data?.data[0] : null,
    });
  };

  getListShares = async (q, callback) => {
    this.setState({ isLoading: true });
    const { active } = this.state;
    if (!active) return;
    let { data } = await NewsDataService.getNewsIdCate(active, q);
    this.setState({
      list: data?.data || [],
      isLoading: false,
    });
    callback && callback();
  };

  loadRefresh(done) {
    this.getListShares("", () => done());
  }

  onChangeSearch = (e) => {
    this.setState({
      value: e,
    });
    this.getListShares(e);
  };

  render() {
    const { loading, page, active, data, list, isLoading, value } = this.state;
    return (
      <Page
        name="news-list"
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
        style={{
          "--f7-subnavbar-height": "54px",
        }}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">{page?.text}</span>
            </div>
            {/* <div className="page-navbar__noti search">
              <Link searchbarEnable=".searchbar-share">
                <i className="las la-search"></i>
              </Link>
            </div> */}
          </div>
          <Searchbar
            className="searchbar-share"
            value={value}
            expandable
            customSearch={true}
            disableButton={!this.$theme.aurora}
            placeholder="Bạn cần tìm ?"
            disableButtonText="Đóng"
            clearButton={true}
            onChange={(e) => this.onChangeSearch(e.target.value)}
            onClickClear={() => {
              this.onChangeSearch("");
            }}
            onClickDisable={() => {
              this.onChangeSearch("");
            }}
          ></Searchbar>
          <Subnavbar
            className="sub-share"
            style={{ background: "#fff", "--f7-page-searchbar-offset": "54px" }}
          >
            <div
              className="h-100"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "8px",
              }}
            >
              <div className="pt-5px pb-6px h-100 bz-bb">
                <div className="h-100 position-relative">
                  <input
                    className="h-100 pl-40px pr-10px bz-bb w-100"
                    type="text"
                    placeholder="Tìm kiếm"
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "5px",
                    }}
                    onChange={(e) => this.onChangeSearch(e.target.value)}
                  />
                  <i
                    style={{
                      position: "absolute",
                      left: "8px",
                      top: "50%",
                      transform: "translateY(-50%) rotate(-90deg)",
                      pointerEvents: "none",
                      fontSize: "25px"
                    }}
                    className="las la-search"
                  ></i>
                </div>
              </div>
              <div className="pt-5px pb-6px h-100 bz-bb">
                <div className="h-100 position-relative">
                  <select
                    className="h-100 w-100 pl-10px pr-30px bz-bb"
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "5px",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    onChange={(e) => this.setState({ active: e.target.value })}
                  >
                    {data &&
                      data.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.text}
                        </option>
                      ))}
                  </select>
                  <i
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                    className="las la-angle-down"
                  ></i>
                </div>
              </div>
            </div>
            {/* <ShareMenu
              data={data}
              active={active}
              onChange={(val) => this.setState({ active: val, value: "" })}
            /> */}
          </Subnavbar>
        </Navbar>
        <div className="page-wrapper">
          <div className="page-render">
            <div className="page-news__list page-news__all">
              {!isLoading && (
                <div className="page-news__list-ul">
                  {list &&
                    list.map((item, index) => {
                      return (
                        <Link
                          href={"/ads/" + item.id + "/"}
                          className="page-news__list-item"
                          key={item.id}
                        >
                          <div className="images">
                            <img
                              src={
                                SERVER_APP +
                                "/upload/image/" +
                                item.source.Thumbnail
                              }
                              alt={item.source.Title}
                            />
                          </div>
                          <div className="text">
                            <h6>{item.source.Title}</h6>
                          </div>
                        </Link>
                      );
                    })}
                  {(!list || list.length === 0) && (
                    <PageNoData text="Không có dữ liệu" />
                  )}
                </div>
              )}

              {isLoading && <SkeletonNews />}
            </div>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
