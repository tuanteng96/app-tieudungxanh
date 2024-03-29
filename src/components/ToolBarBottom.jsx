import React from "react";
import { Link } from "framework7-react";
import { getUser } from "../constants/user";
import iconBook from "../assets/images/bookicon.png";
import { checkRole } from "../constants/checkRole";
import PrivateNav from "../auth/PrivateNav";
import { CheckPrivateNav } from "../constants/checkRouterHome";
import userService from "../service/user.service";
import { CALL_PHONE } from "../constants/prom21";

export default class ToolBarCustom extends React.Component {
  constructor() {
    super();
    this.state = {
      currentUrl: "",
      infoUser: getUser(),
      phone: "",
    };
  }
  componentDidMount() {
    var $$ = this.Dom7;
    const TYPE = checkRole();
    if (TYPE && TYPE === "ADMIN") {
      $$(".js-toolbar-bottom").find("a").eq(1).addClass("js-active");
    }
    this.getPhone();
  }

  getPhone = () => {
    userService
      .getConfig("Chung.sdt")
      .then(({ data }) => {
        this.setState({
          phone: data?.data && data?.data.length > 0 && data?.data[0].Value,
        });
      })
      .catch((err) => console.log(err));
  };

  componentDidUpdate(prevProps, prevState) {
    var href = this.$f7.views.main.router.url;
    var $$ = this.Dom7;
    const TYPE = checkRole();

    $$(".js-toolbar-link").removeClass("js-active");
    if (prevState.currentUrl !== href) {
      $$(".js-toolbar-link").each(function () {
        const _this = $$(this);
        const hrefLink = _this.attr("href");
        if (href === "/") {
          if (!TYPE || TYPE === "M") {
            $$(".js-toolbar-bottom").find("a").eq(0).addClass("js-active");
            $$(".page-current .js-toolbar-bottom")
              .find("a")
              .eq(0)
              .addClass("js-active");
          }
          if (TYPE === "STAFF") {
            $$(".js-toolbar-bottom").find("a").eq(0).addClass("js-active");
          }
          if (TYPE === "ADMIN") {
            $$(".js-toolbar-bottom").find("a").eq(1).addClass("js-active");
          }
        }
        if (
          hrefLink === href ||
          href
            .split("/")
            .filter((o) => o)
            .some((x) =>
              hrefLink
                .split("/")
                .filter((k) => k)
                .includes(x)
            )
        ) {
          _this.addClass("js-active");
        }
      });
    }
  }

  checkTotal = () => {
    const TYPE = checkRole();

    if (TYPE === "ADMIN") {
      return 3;
    }
    if (TYPE === "STAFF") {
      const arrType = [
        CheckPrivateNav(["service"]),
        [1],
        CheckPrivateNav(["director"]),
        [1],
      ];
      return arrType.filter((item) => item).length;
    }
    return 5;
  };

  handleCall = () => {
    CALL_PHONE(this.state.phone);
  };

  menuToolbar = () => {
    const TYPE = checkRole();
    switch (TYPE) {
      case "STAFF":
        return (
          <React.Fragment>
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-hand-holding-heart"
              text="Dịch vụ"
              roles={["service"]}
              href="/"
            />
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-piggy-bank"
              text="Thống kê"
              roles={"all"}
              href="/employee/statistical/"
            />
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-chart-bar"
              text="Báo cáo"
              roles={["director"]}
              href="/report/"
            />
            {window?.GlobalConfig?.APP?.Staff?.RulesTitle && (
              <Link
                noLinkClass
                href="/rules-list/"
                className={`page-toolbar-bottom__link js-toolbar-link ${TYPE}`}
              >
                <i className="las la-certificate"></i>
                <span>Nội quy</span>
              </Link>
            )}
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-user-circle"
              text="Tài khoản"
              roles="all"
              href="/detail-profile/"
            />
          </React.Fragment>
        );
      case "ADMIN":
        return (
          <React.Fragment>
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-piggy-bank"
              text="Thống kê"
              roles={[]}
              href="/employee/statistical/"
            />
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-chart-bar"
              text="Báo cáo"
              roles={[]}
              href="/report/"
            />
            {window?.GlobalConfig?.APP?.Staff?.RulesTitle && (
              <Link
                noLinkClass
                href="/rules-list/"
                className={`page-toolbar-bottom__link js-toolbar-link ${TYPE}`}
              >
                <i className="las la-certificate"></i>
                <span>Nội quy</span>
              </Link>
            )}
            <Link
              noLinkClass
              href="/detail-profile/"
              className={`page-toolbar-bottom__link js-toolbar-link ${TYPE}`}
            >
              <i className="las la-user-circle"></i>
              <span>Tài khoản</span>
            </Link>
          </React.Fragment>
        );
      case "M":
        return (
          <React.Fragment>
            <Link
              noLinkClass
              href="/news/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                style={{
                  width: "24px",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span>Trang chủ</span>
            </Link>
            {window?.GlobalConfig?.APP?.isSell ? (
              <>
                <Link
                  noLinkClass
                  href="/commission/"
                  className="page-toolbar-bottom__link js-toolbar-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    style={{
                      width: "24px",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                  <span>Cộng đồng</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  noLinkClass
                  href="/shop/"
                  className="page-toolbar-bottom__link js-toolbar-link"
                >
                  <i className="las la-shopping-cart"></i>
                </Link>
              </>
            )}
            {window?.GlobalConfig?.APP?.isSell ? (
              <>
                <Link
                  noLinkClass
                  href="/shop/794/"
                  className="page-toolbar-bottom__link active js-toolbar-link"
                >
                  {/* <div className="page-toolbar-bottom__link-inner">
                    <i className="las la-shopping-basket"></i>
                  </div> */}
                  <i className="las la-shopping-basket"></i>
                  <span>Đặt hàng</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  noLinkClass
                  href="/schedule/"
                  className="page-toolbar-bottom__link active"
                >
                  <div className="page-toolbar-bottom__link-inner">
                    <img src={iconBook} alt="Đặt lịch" />
                    {/* <i className="las la-calendar-plus"></i> */}
                  </div>
                </Link>
              </>
            )}
            {window?.GlobalConfig?.APP?.isSell ? (
              <Link
                noLinkClass
                className="page-toolbar-bottom__link js-toolbar-link"
                onClick={() => this.handleCall()}
              >
                <i className="las la-phone-volume"></i>
                <span>Hotline</span>
              </Link>
            ) : (
              <Link
                noLinkClass
                href="/cardservice/"
                className="page-toolbar-bottom__link js-toolbar-link"
              >
                <i className="las la-clipboard-list"></i>
              </Link>
            )}

            <Link
              noLinkClass
              href="/profile/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-user-circle"></i>
              <span>Tài khoản</span>
            </Link>
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment>
            <Link
              noLinkClass
              href="/news/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                style={{
                  width: "24px",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span>Trang chủ</span>
            </Link>
            {window?.GlobalConfig?.APP?.isSell ? (
              <>
                <Link
                  noLinkClass
                  href="/login/"
                  className="page-toolbar-bottom__link js-toolbar-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    style={{
                      width: "24px",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                  <span>Cộng đồng</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  noLinkClass
                  href="/shop/"
                  className="page-toolbar-bottom__link js-toolbar-link"
                >
                  <i className="las la-shopping-cart"></i>
                </Link>
              </>
            )}
            {/* {window?.GlobalConfig?.APP?.isSell ? (
              <>
                <Link
                  noLinkClass
                  href="/shop/794/"
                  className="page-toolbar-bottom__link active"
                >
                  <div className="page-toolbar-bottom__link-inner">
                    <i className="las la-shopping-basket"></i>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  noLinkClass
                  href="/login/"
                  className="page-toolbar-bottom__link active"
                >
                  <div className="page-toolbar-bottom__link-inner">
                    <img src={iconBook} alt="Đặt lịch" />
                  </div>
                </Link>
              </>
            )} */}
            {window?.GlobalConfig?.APP?.isSell ? (
              <>
                <Link
                  noLinkClass
                  href="/shop/794/"
                  className="page-toolbar-bottom__link active js-toolbar-link"
                >
                  {/* <div className="page-toolbar-bottom__link-inner">
                    <i className="las la-shopping-basket"></i>
                  </div> */}
                  <i className="las la-shopping-basket"></i>
                  <span>Đặt hàng</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  noLinkClass
                  href="/schedule/"
                  className="page-toolbar-bottom__link active"
                >
                  <div className="page-toolbar-bottom__link-inner">
                    <img src={iconBook} alt="Đặt lịch" />
                    {/* <i className="las la-calendar-plus"></i> */}
                  </div>
                </Link>
              </>
            )}

            <Link
              noLinkClass
              className="page-toolbar-bottom__link js-toolbar-link"
              onClick={() => this.handleCall()}
            >
              <i className="las la-phone-volume"></i>
              <span>Hotline</span>
            </Link>
            <Link
              noLinkClass
              href="/login/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-user-circle"></i>
              <span>Tài khoản</span>
            </Link>
            {/* <div className="page-toolbar-indicator">
              <div className="page-toolbar-indicator__left"></div>
              <div className="page-toolbar-indicator__right"></div>
            </div> */}
          </React.Fragment>
        );
    }
  };

  render() {
    return (
      <div className="page-toolbar">
        <div
          className={`page-toolbar-bottom js-toolbar-bottom total-${this.checkTotal()}`}
          id="js-toolbar-bottom"
        >
          {this.menuToolbar()}
        </div>
      </div>
    );
  }
}
