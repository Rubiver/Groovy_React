import { useContext, useEffect, useState } from "react";
import style from "./Sign_Detail.module.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LoginContext } from "../../../../App";

const Sign_Detail = () => {

    const { seq } = useParams();
    const [sign_list, setSign_list] = useState({ seq: seq, writer: "", document_type: "", recipient: "", title: "", contents: "", accept: "", write_date: "", comment: "" });
    const [sign_files, setSign_files] = useState([]);
    const navi = useNavigate();
    const { loginID } = useContext(LoginContext);

    useEffect(e => {
        axios.get(`/api/signlist/${seq}`).then(resp => {
            setSign_list(resp.data);
            console.log(resp.data);
        });

        axios.get(`/api/signfiles/${seq}`).then(resp1 => {
            setSign_files(resp1.data);
            console.log(resp1.data);
        });
    }, []);

    const downloadFile = (file) => {
        // Make an API request to fetch the file content
        axios
            .get(`/api/signfiles/download/${file.sys_name}`, {
                responseType: 'blob',
            })
            .then((response) => {
                const blob = new Blob([response.data]);
                const url = window.URL.createObjectURL(blob);

                // Create an anchor element for downloading the file
                const a = document.createElement('a');
                a.href = url;
                a.download = file.ori_name;
                document.body.appendChild(a);
                a.click();

                // Clean up by removing the anchor element and releasing the URL
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch((error) => {
                console.error('File download error:', error);
            });
    };

    const handleAccept = (e) => {
        axios.put(`/api/signlist/accept/${seq}`).then(resp => {
            navi("/Groovy/signlist/wait");
        }).catch(e => {

        });
    }

    const handleReject = (e) => {
        axios.put(`/api/signlist/reject/${seq}`).then(resp => {
            navi("/Groovy/signlist/wait");
        }).catch(e => {

        });
    }

    return (
        <div>
            <div className={style.header}>
                문서 상세보기
                <hr />
            </div>
            <div className={style.documents1}>
                <div className={style.top}>
                    <div className={style.leftContainer}>
                        <div className={style.docType}>
                            <div className={style.left}>
                                문서종류
                            </div>
                            <div className={style.right}>
                                {`${sign_list.document_type}`}
                            </div>
                        </div>
                        <div className={style.docWriter}>
                            <div className={style.left}>
                                기안자
                            </div>
                            <div className={style.right}>
                                {`${sign_list.writer}`}
                            </div>
                        </div> <div className={style.docDepartment}>
                            <div className={style.left}>
                                소속
                            </div>
                            <div className={style.right}>
                                Git관리부
                            </div>
                        </div> <div className={style.docWrite_Date}>
                            <div className={style.left}>
                                기안작성일
                            </div>
                            <div className={style.right}>
                                2023-11-03
                            </div>
                        </div>
                    </div>
                    <div className={style.rightContainer}>
                        <div className={style.docType}>
                            <div className={style.left}>
                                구분
                            </div>
                            <div className={style.right}>
                                결제자
                            </div>
                        </div>
                        <div className={style.docWriter}>
                            <div className={style.left}>
                                직급
                            </div>
                            <div className={style.right}>
                                과장
                            </div>
                        </div> <div className={style.docDepartment}>
                            <div className={style.left}>
                                이름
                            </div>
                            <div className={style.right}>
                                {`${sign_list.recipient}`}
                            </div>
                        </div> <div className={style.docWrite_Date}>
                            <div className={style.left}>
                                승인여부
                            </div>
                            <div className={style.right}>
                                {sign_list.accept === 0 ? "승인" : sign_list.accept === 1 ? "미승인" : sign_list.accept === 2 ? "반려" : "알 수 없음"}
                            </div>
                        </div>
                    </div>
                    <div className={style.signwrite}>
                        <div className={style.title}>{`${sign_list.document_type}`}</div>
                        <div className={style.tableBox}>
                            <div className={`${style.writeRow} ${style.writeHead}`}>
                                <div>기안부서</div>
                                <div>GIT</div>
                                <div>기안일</div>
                                <div>2023-11-03</div>
                                <div>기안문서</div>
                                <div>자동설정</div>
                            </div>
                            <div className={style.writeRow}>
                                <div>증명서 종류</div>
                                <div>{`${sign_list.document_type}`}</div>
                                <div>용도</div>
                                <div>{`${sign_list.document_type}`}</div>
                                <div>제출처</div>
                                <div>GIT</div>
                            </div>
                            <div className={style.titleRow}>
                                <div>제목</div>
                                <div>{`${sign_list.title}`}</div>
                            </div>
                            <div className={style.contents} dangerouslySetInnerHTML={{ __html: sign_list.contents }}></div>
                        </div>
                        <div className={style.fileList}>
                            {sign_files.map((file, index) => (
                                <div key={index} onClick={() => downloadFile(file)} style={{ cursor: "pointer" }}>
                                    {file.ori_name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={style.buttons}>
                        {loginID == `${sign_list.recipient}` ? (
                            <div>
                                <button onClick={handleAccept}>승인</button>
                                <button onClick={handleReject}>반려</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div >
    );
};
export default Sign_Detail;