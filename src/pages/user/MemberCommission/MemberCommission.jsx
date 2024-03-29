import React from "react";
import { Link, Navbar, Page, Toolbar } from "framework7-react";
import CommissionItem from "./CommissionItem";
import { getUser } from "../../../constants/user";
import UserService from "../../../service/user.service";
import moment from "moment";
import ToolBarCustom from "../../../components/ToolBarBottom";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      CurrentAff: {},
      isLoading: false,
      Filters: {
        MemberID: "",
        JSONTakens: [
          "Levels",
          "Level",
          "Members",
          "ID",
          "FullName",
          "FPaths",
          "FParentID",
          "OrderValue",
          "OrderCount",
          "FValue",
          "FBonusValue",
          "FPlusValue",
        ],
        JSONSkips: [],
        select: "m.ID, m.FullName, m.FPaths, m.FParentID,m.Present",
        member_from: "",
        member_to: "",
        value_from: "", // neu ko truyen thi se lay theo member_from
        value_to: "",
      },
    };
  }
  componentDidMount() {
    this.getListTree({
      ...this.state.Filters,
    });
  }

  getListTree = (filter, callback) => {
    this.setState({ isLoading: true });
    let User = getUser();
    UserService.getFtree({ ...filter, MemberID: User.ID })
      .then(({ data }) => {
        // let newLevels = [
        //   {
        //     parentId: null,
        //     id: User.ID,
        //     level: 0,
        //   },
        // ];
        // let index = 0;
        // for (let level of data.Levels) {
        //   if (level.Members && level.Members.length > 0) {
        //     for (let member of level.Members) {
        //       index += 1;
        //       newLevels.push({
        //         ...member,
        //         level: level.Level,
        //         index: index,
        //         parentId: member.FParentID,
        //         id: member.ID,
        //       });
        //     }
        //   }
        // }
        // const TreeList = arrayToTree(newLevels, {
        //   dataField: null,
        // });
        this.setState({
          data:
            data?.Tree || [],
          // CurrentAff: {
          //   ...User,
          //   TotalChild: data.TotalChild,
          //   TotalChildF0:
          //     (TreeList &&
          //       TreeList[0].children &&
          //       TreeList[0].children.length) ||
          //     0,
          // },
          isLoading: false,
        });
        callback && callback();
      })
      .catch((err) => console.log(err));
  };

  onFilters = (values, close) => {
    this.setState({
      ...this.state.Filters,
      member_from: values?.From || "",
      member_to: values?.To || "",
    });
    this.$f7.dialog.preloader("Đang thực hiện ...");
    this.getListTree(
      {
        ...this.state.Filters,
        member_from: values.From
          ? moment(values.From).format("YYYY-MM-DD")
          : "",
        member_to: values.To ? moment(values.To).format("YYYY-MM-DD") : "",
      },
      () => {
        this.$f7.dialog.close();
        close();
      }
    );
  };

  // async loadRefresh(done) {
  //   done();
  // }

  render() {
    const { data, CurrentAff, isLoading } = this.state;
    return (
      <Page
        //noToolbar
        name="profile-list"
        className="bg-white"
        // ptr
        // infiniteDistance={50}
        // onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Thành viên & hoa hồng</span>
            </div>
            {/* <PickerFilter
              initialValues={{
                To: this.state.Filters.To,
                From: this.state.Filters.To,
              }}
              onSubmit={this.onFilters}
            >
              {({ open }) => (
                <div className="page-navbar__noti noti" onClick={open}>
                  <Link noLinkClass>
                    <RiFilter2Line />
                  </Link>
                </div>
              )}
            </PickerFilter> */}
          </div>
        </Navbar>

        <div
          className="h-100 position-relative overflow-hidden d--f fd--c"
          id="commission"
        >
          <div
            className="position-relative"
            style={{
              background: "#f1f1f1",
              padding: "15px",
              // minHeight: "70px",
              // height: "70px",
              // boxSizing: "border-box",
            }}
          >
            <div className="text-center fw-600">
              {data?.Member?.FullName}
              <span className="pl-5px">
                - Tổng {data?.SubTotal} thành viên
              </span>
            </div>
            <div className="text-center fw-600">
              (F1) - {data?.FSubs?.length || 0} thành viên
            </div>
          </div>
          {isLoading && <div className="p-15px">Đang tải dữ liệu ...</div>}
          {!isLoading && (
            <div className="fg--1 overflow-auto">
              {(!data || data.length === 0) && (
                <div className="p-15px">Không có dữ liệu.</div>
              )}
              {data &&
                data.FSubs && data.FSubs.map((item, index) => (
                  <CommissionItem key={index} data={item} level={index + 1} />
                ))}
            </div>
          )}
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarCustom />
        </Toolbar>
      </Page>
    );
  }
}
