import React, { createRef } from "react";
import { SERVER_APP } from "./../../constants/config";
import Skeleton from "react-loading-skeleton";
import ReactHtmlParser from "react-html-parser";
import NewsDataService from "../../service/news.service";
import { Page, Link, Navbar, Toolbar, f7 } from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import NotificationIcon from "../../components/NotificationIcon";
import { OPEN_LINK, SHARE_SOCIAL } from "../../constants/prom21";
import { getUser } from "../../constants/user";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrayItem: null,
      isLoading: true,
      showPreloader: false,
      ValueLine: "",
      Photos: [],
    };
    this.myRef = createRef();
  }

  fixedContentDomain = (content) => {
    let user = getUser();
    if (!content) return "";
    return content
      .replace(/src=\"\//g, 'src="' + SERVER_APP + "/")
      .replaceAll("[NAME]", user?.FullName)
      .replaceAll("[PHONE]", user?.MobilePhone)
      .replaceAll("[ID]", user?.ID);
  };

  componentDidMount() {
    const paramsID = this.$f7route.params.postId;
    NewsDataService.getDetailNew(paramsID)
      .then((response) => {
        let obj = response.data.data[0];
        let Photos = [];
        for (let x of obj?.Photos) {
          Photos.push(`${SERVER_APP}/upload/image/${x}`);
        }
        this.setState({
          arrayItem: {
            ...obj,
          },
          Photos: Photos,
          isLoading: false,
        });
      })
      .catch((er) => console.log(er));
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.state.arrayItem !== nextState.arrayItem) {
      this.setState({ ValueLine: this.myRef?.current?.innerText });
    }
  }

  loadRefresh(done) {
    setTimeout(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
      });
      done();
    }, 1000);
  }

  render() {
    const { arrayItem, isLoading, ValueLine, Photos } = this.state;
    return (
      <Page
        name="news-list-detail"
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              {arrayItem ? (
                <span className="title">{arrayItem.Title}</span>
              ) : (
                <span className="title">Loading ...</span>
              )}
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        {!isLoading && arrayItem ? (
          <div className="page-render p-0 no-bg">
            <div className="page-news">
              <div className="page-news__detail">
                <div className="page-news__detail-img position-relative">
                  <img src={SERVER_APP + arrayItem.Thumbnail_web} />
                </div>
                <div className="page-news__detail-content">
                  <div className="page-news__detail-shadow" ref={this.myRef}>
                    {/* {ReactHtmlParser(this.fixedContentDomain(arrayItem.Desc), {
                      transform: (node) => {
                        if (
                          node.type === "tag" &&
                          node.attribs.class === "external"
                        ) {
                          return (
                            <Link
                              class="external"
                              onClick={() => OPEN_LINK(node.attribs.href)}
                            >
                              {node.children[0].data}
                            </Link>
                          );
                        }
                      },
                    })} */}
                    {ReactHtmlParser(
                      this.fixedContentDomain(arrayItem.Content),
                      {
                        transform: (node) => {
                          if (
                            node.type === "tag" &&
                            node.attribs.class === "external"
                          ) {
                            return (
                              <Link
                                class="external"
                                onClick={() => OPEN_LINK(node.attribs.href)}
                              >
                                {node.children[0].data}
                              </Link>
                            );
                          }
                        },
                      }
                    )}
                  </div>
                </div>
                {/* <div class="px-15px">
                  {arrayItem?.Photos &&
                    arrayItem?.Photos.map(
                      (x) => SERVER_APP + "/upload/image/" + x
                    ).map((x, i) => (
                      <div className="mb-10px position-relative" key={i}>
                        <img className="w-100" src={x} alt="" />
                        <button
                          type="button"
                          className="bg-primary text-white"
                          style={{
                            border: 0,
                            borderRadius: "4px",
                            padding: "8px 15px",
                            width: "auto",
                            fontWeight: "500",
                            fontSize: "15px",
                            position: "absolute",
                            top: "15px",
                            right: "15px",
                          }}
                          onClick={() => OPEN_LINK(x)}
                        >
                          Tải ảnh xuống
                        </button>
                      </div>
                    ))}
                </div> */}
                <div className="px-15px pb-15px">
                  <CopyToClipboard
                    text={ValueLine}
                    onCopy={() => {
                      toast.success("Copy nội dung thành công !", {
                        position: toast.POSITION.TOP_LEFT,
                        autoClose: 1000,
                      });
                      SHARE_SOCIAL(
                        JSON.stringify({
                          Images: Photos,
                          Content: ValueLine,
                        })
                      );
                    }}
                  >
                    <button
                      className="bg-success text-white"
                      style={{
                        border: 0,
                        borderRadius: "4px",
                        padding: "12px",
                        fontWeight: "500",
                        fontSize: "16px",
                      }}
                    >
                      Chia sẻ
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="page-render p-0 no-bg">
            <div className="page-news">
              <div className="page-news__detail">
                <div className="page-news__detail-img">
                  <Skeleton height={180} />
                </div>
                <div className="page-news__detail-content">
                  <div className="page-news__detail-shadow">
                    <Skeleton count={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
