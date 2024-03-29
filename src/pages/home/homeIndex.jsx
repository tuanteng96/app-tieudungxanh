import React, { Suspense } from "react";
import bgHeaderTop from "../../assets/images/bg-header-home.png";
import { Page, Link, Toolbar, f7, Sheet, Button } from "framework7-react";
import UserService from "../../service/user.service";
import IconSearch from "../../assets/images/icon-search.png";
// const ModalReviews = React.lazy(() => import("../../components/ModalReviews"));
// const SelectStock = React.lazy(() => import("../../components/SelectStock"));
// import SelectStock from "../../components/SelectStock";
import CartToolBar from "../../components/CartToolBar";
import ToolBarBottom from "../../components/ToolBarBottom";
import NotificationIcon from "../../components/NotificationIcon";
import {
  getUser,
  setStockIDStorage,
  getStockIDStorage,
  setStockNameStorage,
  getStockNameStorage,
  removeStockNameStorage,
  setUserStorage,
} from "../../constants/user";
import ListService from "./components/Service/ListService";
import SlideList from "../home/components/BannerSlide/SlideList";
import SlideListCenter from "./components/BannerSlide/SlideListCenter";
// const ListImage = React.lazy(() =>
//   import("../home/components/Customer/ListImage")
// );
import NewsList from "../home/components/news/NewsList";
// const NewsList = React.lazy(() => import("../home/components/news/NewsList"));
// const QuickAction = React.lazy(() => import("../../components/quickAction"));
// const ProductList = React.lazy(() =>
//   import("../home/components/Product/ProductList")
// );
import ProductList from "../home/components/Product/ProductList";
import ModalChangePWD from "../../components/ModalChangePWD";
// import ServiceHot2 from "./components/ServiceHot/ServiceHot2";
import ServiceHot from "./components/ServiceHot/ServiceHot";
import PopupImages from "./components/PopupImages";
import SlideListHome from "./components/BannerSlide/SlideListHome";
import PopupImageAlert from "./components/PopupImageAlert";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrNews: [],
      isOpenStock: false,
      width: window.innerWidth,
      showPreloader: false,
      isReload: 0,
      opened: false,
      isPopup: false,
    };
  }

  componentDidMount() {
    const stockName = getStockNameStorage();
    const userCurent = getUser();
    if (userCurent && !userCurent.FActive) {
      this.setState({
        opened: true,
      });
    }
    this.setState({
      stockName: stockName,
    });
  }

  onPageBeforeIn = () => {
    const getStock = getStockIDStorage();

    UserService.getStock()
      .then((response) => {
        let indexStock = 0;
        const arrStock = response.data.data.all;

        const countStock = arrStock.length;
        const CurrentStockID = response.data.data.CurrentStockID;
        if (getStock) {
          indexStock = arrStock.findIndex(
            (item) => item.ID === parseInt(getStock)
          );
        }
        const indexCurrentStock = arrStock.findIndex(
          (item) => item.ID === parseInt(CurrentStockID)
        );

        if (countStock === 2) {
          const StockID = arrStock.slice(-1)[0].ID;
          const TitleStockID = arrStock.slice(-1)[0].Title;
          setStockIDStorage(StockID);
          setStockNameStorage(TitleStockID);
          this.setState({
            isReload: this.state.isReload + 1,
            stockName: TitleStockID,
          });
        }
        setTimeout(() => {
          if (indexCurrentStock <= 0 && indexStock <= 0 && countStock > 2) {
            removeStockNameStorage();
            this.setState({
              isOpenStock: true,
              stockName: null,
            });
          }
        }, 500);
      })
      .catch((e) => console.log(e));
  };

  handleStock = () => {
    this.setState({
      isOpenStock: !this.state.isOpenStock,
    });
  };

  nameStock = (name) => {
    this.setState({
      stockName: name,
    });
  };

  searchPage = () => {
    this.$f7router.navigate("/search/");
  };

  getUsers = (callback) => {
    UserService.getInfo().then(({ data }) => {
      if (data?.token) {
        setUserStorage(data.token, data);
        callback && callback();
      }
    });
  };

  loadRefresh(done) {
    this.getUsers(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
      });
      done();
    });
  }

  render() {
    const { isOpenStock, isPopup, isReload, opened } = this.state;
    return (
      <Page
        noNavbar
        name="home"
        onPageBeforeIn={() => this.onPageBeforeIn()}
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        {/* opened */}
        <Sheet
          opened={opened}
          style={{
            height: "90%",
            "--f7-sheet-bg-color": "#fff",
            borderRadius: "20px 20px 0 0",
          }}
          backdrop
          closeByBackdropClick={false}
        >
          <ModalChangePWD
            onReload={() => {
              UserService.getInfo().then(({ data }) => {
                setUserStorage(data.token, data);
                if (data.FActive) {
                  this.setState({
                    opened: false,
                    isPopup: true,
                  });
                }
              });
              // this.$f7.views.main.router.navigate(
              //   this.$f7.views.main.router.url,
              //   {
              //     reloadCurrent: true,
              //   }
              // );
            }}
          />
        </Sheet>
        <div className="page-wrapper">
          <div className="page-render p-0">
            <div className="home-page">
              <div className="home-page__header">
                <div
                  className="top"
                  style={{
                    background: `url(${bgHeaderTop}) center bottom/cover no-repeat white`,
                  }}
                >
                  <div className="d--f p-12px">
                    <div className="body-search f--1">
                      <button type="button">
                        <img src={IconSearch} />
                      </button>
                      <input
                        type="text"
                        placeholder="Bạn tìm gì hôm nay ?"
                        onFocus={this.searchPage}
                      ></input>
                    </div>
                    <div className="d--f ai--c jc--c home-noti">
                      <NotificationIcon />
                    </div>
                    <CartToolBar className="cart-home d--f ai--c jc--c home-noti" />
                  </div>
                </div>
                <div className="body">
                  <div className="position-relative px-12px">
                    <SlideListHome
                      OpenStock={this.handleStock}
                      f7router={this.$f7router}
                      f7={this.$f7}
                      BannerName="APP.BANNER"
                      autoplaySpeed={3000}
                    />
                  </div>
                  <div className="lst-sv pb-12px">
                    <ListService id="42" OpenStock={this.handleStock} />
                    {/* {getUser() && (
                      <ListService
                        OpenStock={this.handleStock}
                        f7router={this.$f7router}
                        f7={this.$f7}
                        className="my-10px"
                        id="45"
                      />
                    )} */}
                  </div>
                </div>
              </div>
              <ProductList tag="2" />
              {/* <ServiceHot2
                id="APP.SALE"
                f7router={this.$f7router}
                f7={this.$f7}
                OpenStock={this.handleStock}
              /> */}
              <ServiceHot f7router={this.$f7router} />
              <SlideList
                className={`banner-main bg-white ${
                  window.GlobalConfig.APP.Home?.SliderFull
                    ? "mb-8px"
                    : "px-15px pt-15px"
                } `}
                BannerName="APP.MAIN"
                autoplaySpeed={4000}
                OpenStock={this.handleStock}
                f7router={this.$f7router}
                f7={this.$f7}
              />
              {window.GlobalConfig.APP.Home?.SliderFull ? (
                <SlideList
                  className="banner-main bg-white"
                  BannerName="APP.MAINSALE"
                  autoplaySpeed={4500}
                  OpenStock={this.handleStock}
                  f7router={this.$f7router}
                  f7={this.$f7}
                />
              ) : (
                <SlideListCenter
                  className="mb-8px px-15px pb-15px pt-12px"
                  BannerName="APP.MAINSALE"
                  autoplaySpeed={4500}
                  OpenStock={this.handleStock}
                  f7router={this.$f7router}
                  f7={this.$f7}
                />
              )}
              <SlideList
                containerClass="pl-15px pr-15px slider-hot"
                BannerName="APP.SALE"
                OpenStock={this.handleStock}
                f7router={this.$f7router}
                f7={this.$f7}
              />
              <ProductList tag="1" Title="Sản phẩm mới" />
              <div className="px-12px">
                <SlideList
                  className="banner-main bg-white mb-10px mt-10px"
                  BannerName="APP.MIDDLE"
                  autoplaySpeed={4500}
                  OpenStock={this.handleStock}
                  f7router={this.$f7router}
                  f7={this.$f7}
                />
              </div>
              <ProductList tag="3" Title="Sản phẩm Sale" />
              <NewsList />
            </div>
          </div>
        </div>

        <PopupImages f7={this.$f7} />
        <PopupImageAlert
          visible={isPopup}
          onClose={() => this.setState({ isPopup: false })}
        />
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>

        {/* <SelectStock
          isOpenStock={isOpenStock}
          nameStock={(name) => this.nameStock(name)}
          isReload={isReload}
        /> */}
      </Page>
    );
  }
}
