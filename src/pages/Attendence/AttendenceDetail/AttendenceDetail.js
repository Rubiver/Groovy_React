import { useContext, useEffect, useState } from "react";
import style from "./AttendenceDetail.module.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import TodayIcon from '@mui/icons-material/Today';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { red, blue } from '@mui/material/colors';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BadgeIcon from '@mui/icons-material/Badge';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import Button from '@mui/material/Button';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { LoginContext } from "../../../App";
import { useWebSocket } from "../../../WebSocketContext/WebSocketContext";
import { MemberContext } from "../../Groovy/Groovy";
import { format } from 'date-fns';


const CircularIndeterminate = () => {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
        </Box>
    );
};


const Attendence_Detail = ({}) => {

    const { seq } = useParams();
    const [sign_list, setSign_list] = useState({});
    const [sign_files, setSign_files] = useState([]);
    const navi = useNavigate();
    const { loginID } = useContext(LoginContext);
    const stompClient = useWebSocket();
    const [loading, setLoading] = useState(true);

    const members = useContext(MemberContext);

    const [signWriterInfo, setSignWriterInfo] = useState({});
    const [signReceiverInfo, setSignReceiverInfo] = useState({});
    const [receiverVacation,setReceiverVacation]= useState({});
    const startDate = new Date(sign_list.startDate);
    const endDate = new Date(sign_list.endDate);
    
    useEffect(() => {
        axios.get(`/api/attend/${seq}`).then(resp => {
            setSign_list(resp.data);

            if (resp.data.recipient) {
                axios.get(`/api/member/signWriterInfo/${resp.data.writer}`).then(resp2 => {
                    setSignWriterInfo(resp2.data);
                });

                axios.get(`/api/member/signReceiverInfo/${resp.data.recipient}`).then(resp2 => {
                    setSignReceiverInfo(resp2.data);
                });
            }
            axios.get(`/api/vacationfiles/${seq}`).then(resp1 => {
                setSign_files(resp1.data);
                setLoading(false);
            });
        });


    }, [seq]);

    useEffect(() => {
        if (signReceiverInfo && signReceiverInfo.id) {
            axios.get(`/api/vacation/selectVacation/${signReceiverInfo.id}`)
                .then(resp => {
                    setReceiverVacation(resp.data);
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
        }
    }, [signReceiverInfo]);

    const downloadFile = (file) => {
        // Make an API request to fetch the file content
        axios
            .get(`/api/vacationfiles/download/${file.sys_name}`, {
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

    const handleCommentChange = (e) => {
        const { name, value } = e.target;
        setSign_list(prev => ({ ...prev, [name]: value }))
    }

    
    const handleAccept = (e) => {
     
        if (receiverVacation.remainingDays < sign_list.total_date) {
            alert(`신청자의 남은 휴가가 신청일수보다 적습니다.\n신청자의 남은 휴가: ${receiverVacation.remainingDays}, 신청휴가: ${sign_list.total_date}`);
            return; 
        }


        axios.put(`/api/attend/accept/${seq}`, sign_list).then(resp => {
            const parentSeq = resp.data;
            const message = "휴가 신청이 승인되었습니다.";
            const messageObject = { message, recipient: sign_list.writer, parent_seq: parentSeq };

            if (stompClient) {
                stompClient.send("/app/notice", {}, JSON.stringify(messageObject));
            }

            navi("/Groovy/attendence");
        }).catch(e => {

        });


    }

    const handleReject = (e) => {
        axios.put(`/api/attend/reject/${seq}`, sign_list).then(resp => {
            const parentSeq = resp.data;
            const message = "휴가 신청이 반려되었습니다.";
            const messageObject = { message, recipient: sign_list.writer, parent_seq: parentSeq };

            if (stompClient) {
                stompClient.send("/app/notice", {}, JSON.stringify(messageObject));
            }

            navi("/Groovy/attendence");
        }).catch(e => {

        });
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}년 ${month}월 ${day}일`;
    };

    if (loading) {
        // 데이터 로딩 중에는 로딩창을 표시
        return <CircularIndeterminate />;
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
                        <List
                            sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }} >
                                        <ArticleIcon />
                                    </Avatar>
                                    <ListItemText secondary="문서종류" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={`${sign_list.document_type}`}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }} >
                                        <AccountBoxIcon />
                                    </Avatar>
                                    <ListItemText secondary="기안자" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={signWriterInfo.name}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }}>
                                        <BusinessIcon />
                                    </Avatar>
                                    <ListItemText secondary="소속" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={signWriterInfo.group_name}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }}>
                                        <TodayIcon />
                                    </Avatar>
                                    <ListItemText secondary="기안작성일" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={formatDate(sign_list.write_date)}
                                />
                            </ListItem>
                        </List>
                    </div>
                    <div className={style.rightContainer}>
                        <List
                            sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }} >
                                        <HowToRegIcon />
                                    </Avatar>
                                    <ListItemText secondary="구분" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary="결제자"
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }} >
                                        <BadgeIcon />
                                    </Avatar>
                                    <ListItemText secondary="직급" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={signReceiverInfo.position}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }}>
                                        <AccountBoxIcon />
                                    </Avatar>
                                    <ListItemText secondary="이름" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={signReceiverInfo.name}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemAvatar sx={{ textAlign: 'center', width: '80px' }}>
                                    <Avatar sx={{ marginLeft: '20px', backgroundColor: blue[200] }}>
                                        <HelpOutlineIcon />
                                    </Avatar>
                                    <ListItemText secondary="승인여부" />
                                </ListItemAvatar>
                                <ListItemText
                                    primaryTypographyProps={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                    primary={sign_list.accept === 0 ? <DoneIcon style={{ color: 'green' }} /> : sign_list.accept === 1 ? <HourglassTopIcon style={{ color: blue[600] }} /> : sign_list.accept === 2 ? <CloseIcon style={{ color: red[600] }} /> : <QuestionMarkIcon />}
                                />
                            </ListItem>
                        </List>
                    </div>
                    <div className={style.signwrite}>
                        <div className={style.title}>{`${sign_list.document_type}`}</div>
                        <div className={style.tableBox}>
                            <TableContainer>
                                <Table sx={{ minWidth: 650, width: '100%' }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">기안부서</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{signWriterInfo.group_name}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">기안일</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{formatDate(sign_list.write_date)}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">기안문서</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">자동설정</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">증명서 종류</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{`${sign_list.document_type}`}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">용도</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{`${sign_list.document_type}`}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">제출처</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{signWriterInfo.group_name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">시작일</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{format(startDate, 'yyyy년 MM월 dd일')}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">종료일</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{format(endDate, 'yyyy년 MM월 dd일')}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">일수</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid gray', fontSize: '20px', fontWeight: 'bold' }} align="center">{sign_list.total_date}일</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontSize: '20px', fontWeight: 'bold', backgroundColor: '#f2f2f2' }} align="center">제목</TableCell>
                                            <TableCell sx={{ fontSize: '20px', fontWeight: 'bold' }} align="center" colSpan={5}>{`${sign_list.title}`}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

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
                        {loginID == sign_list.recipient && sign_list.accept === 1 ? (
                            <div>
                                <div className={style.comment}>
                                    <input type="text" name="comment" placeholder="코멘트 입력" className={style.input} value={sign_list.comment}
                                        onChange={handleCommentChange}></input>
                                </div>
                                <Button variant="outlined" onClick={handleAccept}>승인</Button>
                                <Button variant="outlined" color="error" onClick={handleReject}>반려</Button>
                            </div>
                        ) : (
                            <div className={style.commentText}>
                                {sign_list.comment ? sign_list.comment : ''}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};
export default Attendence_Detail;