import React from "react";
import bgImage from "../../assets/images/headerbottombgapp.png";
import {
  checkAvt,
  formatPoint,
  formatPriceVietnamese,
} from "../../constants/format";
import { getUser, getPassword, app_request } from "../../constants/user";
import { Page, Link, Toolbar, Row, Col, f7 } from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import Skeleton from "react-loading-skeleton";
import {
  REMOVE_BADGE,
  SEND_TOKEN_FIREBASE,
  SET_BADGE,
} from "../../constants/prom21";
import { iOS } from "../../constants/helpers";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      memberInfo: {},
      isLoading: true,
      showPreloader: false,
    };
  }
  componentDidMount() {
    // const username = infoUser.MobilePhone
    //   ? infoUser.MobilePhone
    //   : infoUser.UserName;
    // const password = getPassword();
    UserService.getInfo()
      .then(({ data }) => {
        if (data.error) {
          this.$f7router.navigate("/login/");
        } else {
          this.setState({
            memberInfo: data,
            isLoading: false,
          });
        }
      })
      .catch((err) => console.log(err));
  }
  signOut = () => {
    const $$this = this;
    $$this.$f7.dialog.confirm(
      "Bạn muốn đăng xuất khỏi tài khoản ?",
      async () => {
        f7.dialog.preloader(`Đăng xuất ...`);
        SEND_TOKEN_FIREBASE().then(async (response) => {
          if (!response.error && response.Token) {
            const { ID, acc_type } = getUser();
            await UserService.authRemoveFirebase({
              Token: response.Token,
              ID: ID,
              Type: acc_type,
            });
          } else {
            app_request("unsubscribe", "");
          }
          iOS() && REMOVE_BADGE();
          await localStorage.clear();
          await new Promise((resolve) => setTimeout(resolve, 800));
          f7.dialog.close();
          $$this.$f7router.navigate("/", {
            reloadCurrent: true,
          });
        });
      }
    );
  };

  checkMember = (memberInfo) => {
    if (!memberInfo) return false;
    if (memberInfo.acc_type === "M") {
      return memberInfo.acc_group > 0
        ? memberInfo.MemberGroups[0].Title
        : "Thành viên";
    }
    if (memberInfo.ID === 1) {
      return "ADMIN";
    }
    if (memberInfo.acc_type === "U" && memberInfo.GroupTitles.length > 0) {
      return memberInfo.GroupTitles.join(", ");
    }
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
      });
      done();
    }, 600);
  }

  render() {
    const { memberInfo, isLoading } = this.state;
    return (
      <Page
        name="profile-list"
        noNavbar
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <div className="profile-bg">
          <div className="page-login__back">
            <Link onClick={() => this.$f7router.back()}>
              <i className="las la-arrow-left"></i>
            </Link>
          </div>
          <div className="name">{memberInfo && memberInfo.FullName}</div>
          <div className="profile-bg__logout">
            <Link onClick={() => this.signOut()}>
              <i className="las la-sign-out-alt"></i>
            </Link>
          </div>
          <img src={bgImage} />
        </div>
        <div className="profile-info">
          <div
            className="profile-info__avatar"
            onClick={() =>
              this.$f7.views.main.router.navigate("/detail-profile/")
            }
          >
            {isLoading ? (
              <Skeleton circle={true} height={90} width={90} />
            ) : (
              <img src={checkAvt(memberInfo && memberInfo.Photo)} />
            )}
          </div>
          {isLoading ? (
            <div className="profile-info__basic">
              <div className="name">
                <Skeleton width={100} count={1} />
              </div>
              <div className="group">
                <Skeleton width={120} count={1} />
              </div>
            </div>
          ) : (
            <div className="profile-info__basic">
              <div className="name">{memberInfo && memberInfo.FullName}</div>
              <div className="group">
                {this.checkMember(memberInfo && memberInfo)}
              </div>
            </div>
          )}
          <div className="text-center mb-12px">
            <CopyToClipboard
              text={memberInfo?.ID}
              onCopy={() => {
                toast.success("Copy mã thành công !", {
                  position: toast.POSITION.TOP_LEFT,
                  autoClose: 1000,
                });
              }}
            >
              <div className="d--if bg-ezs fw-400 text-white rounded-sm overflow-hidden">
                <div className="px-10px py-5px font-size-xs">Mã giới thiệu</div>
                <div
                  className="d-flex ai--c px-8px"
                  style={{ background: "var(--ezs-color-gradient)" }}
                >
                  {memberInfo?.ID}
                </div>
                <button className="w-auto border-0 font-size-lg">
                  <i className="las la-copy"></i>
                </button>
              </div>
            </CopyToClipboard>
          </div>
          <div
            style={{
              borderTop: "1px solid #f0f4f7",
            }}
          >
            <div className="d--f">
              <div
                style={{
                  width: "calc(100%/3)",
                }}
              >
                <Link
                  noLinkClass
                  href="/wallet/"
                  className="d--f jc--c text-center fd--c py-15px"
                >
                  <div
                    style={{
                      color: "#929292",
                    }}
                  >
                    Ví điện tử
                  </div>
                  <div
                    style={{
                      fontFamily: "Archivo Narrow",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#000",
                    }}
                  >
                    {memberInfo &&
                      memberInfo?.MoneyKinds &&
                      formatPriceVietnamese(memberInfo?.MoneyKinds["Ví"] || 0)}
                  </div>
                </Link>
              </div>
              <div
                style={{
                  width: "calc(100%/3)",
                  borderLeft: "1px solid #f0f4f7",
                  borderRight: "1px solid #f0f4f7",
                  color: "#000",
                }}
              >
                <Link
                  noLinkClass
                  href="/point-history/"
                  className="d--f jc--c text-center fd--c py-15px"
                >
                  <div
                    style={{
                      color: "#929292",
                    }}
                  >
                    Điểm thưởng
                  </div>
                  <div
                    style={{
                      fontFamily: "Archivo Narrow",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#000",
                    }}
                  >
                    {memberInfo &&
                      memberInfo?.MoneyKinds &&
                      formatPoint((memberInfo?.MoneyKinds["Tặng điểm"] || 0) - (memberInfo?.MoneyKinds["_DIEM_PENDING_"] || 0) )}
                  </div>
                </Link>
              </div>
              <div
                style={{
                  width: "calc(100%/3)",
                }}
              >
                <Link
                  noLinkClass
                  href="/card-history/"
                  className="d--f jc--c text-center fd--c py-15px"
                >
                  <div
                    style={{
                      color: "#929292",
                    }}
                  >
                    Thẻ tiền
                  </div>
                  <div
                    style={{
                      fontFamily: "Archivo Narrow",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#000",
                    }}
                  >
                    {memberInfo &&
                      memberInfo?.MoneyKinds &&
                      formatPriceVietnamese(
                        ((memberInfo?.MoneyKinds["Kích hoạt tài khoản "] || 0) - (memberInfo?.MoneyKinds["_TIEN_PENDING_"] || 0)) < 0 ? 0 : (memberInfo?.MoneyKinds["Kích hoạt tài khoản "] || 0) - (memberInfo?.MoneyKinds["_TIEN_PENDING_"] || 0)
                      )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white mt-5px mb-15px profile-2">
          <div className="item">
            <Link href="/detail-profile/">
              Thông tin cá nhân
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
          <div className="item">
            <Link href="/wallet/">
              Ví điện tử / Rút tiền
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
          <div className="item">
            <Link href="/point-history/">
              Lịch sử điểm thưởng
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
          <div className="item">
            <Link href="/card-history/">
              Lịch sử thẻ tiền
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
          <div className="item">
            <Link href="/order/">
              Quản lý đơn hàng
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
          <div className="item">
            <Link className="text-danger" onClick={() => this.signOut()}>
              Đăng xuất
            </Link>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
