import React, { useContext, useEffect, useState } from "react";
import style from "./Org_Chart.module.css"
import Org_Chart_Table from "./Org_Chart_Body/Org_Chart_Table/Org_Chart_Table";
import Org_Chart_DropDown from "./Org_Chart_Body/Org_Chart_DropDown/Org_Char_DropDown";
import Org_Chart_View from "./Org_Chart_Body/Org_Chart_View/Org_Chart_View";
import axios from "axios";
import { MemberContext } from "../../../Groovy/Groovy";

const Org_Chart = ({ isOpen, close, approver, setApprover }) => {

    const [employees, setEmployees] = useState({}); // 여기서 선택된 직원의 목록을 보여줍니다.
    const [backUpEmployees, setBackUpEmployees] = useState({}); // 원래 직원의 목록을 저장합니다
    const [selectedRow, setSelectedRow] = useState(null); //선택한 행의 값을 가져옵니다.
    const [selectMemberdetail, setSelectMemberdetail] = useState({}); //선택한 직원에 상새정보를 가져옵니다.

    useEffect(() => {
        axios.get("/api/member/selectedEmployee").then(resp => {
            console.log(resp.data);
            setEmployees(resp.data)
            setBackUpEmployees(resp.data);
        });
    }, []);


    if (!isOpen) return null;

    // 선택된 직원을 업데이트하는 함수
    const handleEmployeeSelect = (employee) => {
        setEmployees(employee);
    };

    // '중간결제자' 또는 '최종결제자' 버튼 클릭 시 처리할 함수
    const handleSelect = () => {
        console.log("선택한 놈의 아이디: " + selectedRow);

        if (selectedRow == null) {
            return;
        }

        //조건식을 설정하는 부분
        // if(members.member.id===selectedRow){
        //     alert("다른 결재자를 선택하세요");
        //     return;
        // }

        axios.get(`/api/member/${selectedRow}`).then(resp => {
            console.log(resp.data);
            setApprover(resp.data);
        })

        axios.get(`/api/member/detail/${selectedRow}`).then(resp => {
            console.log(resp.data);
            setSelectMemberdetail(resp.data);
        })
    };

    return (
        <div>
            <div className={style.modal_overlay}>

                <div className={style.modal}>
                    <div className={style.modal_head}>
                        <h4 className={style.modal_title}>직원 검색</h4>
                    </div>

                    <div className={style.modal_body}>

                        <div className={style.search_div}>

                            <div className={style.dropbox}>
                                <Org_Chart_DropDown employees={employees} setEmployees={setEmployees} backUpEmployees={backUpEmployees} />
                            </div>

                            <div className={style.tablebox}>
                                <Org_Chart_Table employees={employees} setEmployees={setEmployees}
                                    selectedRow={selectedRow} setSelectedRow={setSelectedRow}
                                    setBackUpEmployees={setBackUpEmployees} setApprover={setApprover} setSelectMemberdetail={setSelectMemberdetail} />
                            </div>

                        </div>


                        <div className={style.select_div}>
                            <div className={style.image}>
                                <img src="/assets/right_Arrow.png" alt="" />
                            </div>
                            {/* <div className={style.select_btndiv}>
                                <button className={style.modal_close_button} onClick={handleSelect}>결제자 선택</button>
                            </div> */}
                        </div>


                        <div className={style.view_div}>

                            <Org_Chart_View approver={approver} selectMemberdetail={selectMemberdetail} />

                        </div>

                    </div>

                    <div className={style.modal_footer}>
                        <button onClick={close} className={style.modal_close_button}>확인</button>
                        <button onClick={close} className={style.modal_close_button}>닫기</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Org_Chart;