import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
const CloudshellTerminal = (socket) => {

        let sessionLogEnable = false;
        let loggedData = false;
        let sessionLog;
        let sessionFooter;
        let logDate;
        let currentDate;
        let myFile;
        let errorExists;
        const rowsCalculate = window.location.pathname.includes('cloudshell-terminal') ? Math.round(window.innerHeight / 20) : Math.round(window.innerHeight / 22)
        const term = new Terminal({ rows: rowsCalculate });
        const fitAddon = new FitAddon();
        // DOM properties
        const logBtn = document.getElementById('logBtn');
        const downloadLogBtn = document.getElementById('downloadLogBtn');
        const status = document.getElementById('status');
        const header = document.getElementById('header');
        const footer = document.getElementById('footer');
        const terminalContainer = document.getElementById('terminal-container');
        terminalContainer.innerHTML = "";
        term.loadAddon(fitAddon);
        term.open(terminalContainer);
        term.focus();
        fitAddon.fit();

        // cross browser method to 'download' an element to the local system
        // used for our client-side logging feature
        const downloadLog = () => {
                if (loggedData === true) {
                        myFile = 'WebSSH2-'
                                .concat(logDate.getFullYear())
                                .concat(logDate.getMonth() + 1)
                                .concat(logDate.getDate(), '_')
                                .concat(logDate.getHours())
                                .concat(logDate.getMinutes())
                                .concat(logDate.getSeconds(), '.log');
                        // regex should eliminate escape sequences from being logged.
                        const blob = new Blob(
                                [
                                        sessionLog.replace(
                                                // eslint-disable-next-line no-control-regex
                                                /[\u001b\u009b][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><;]/g,
                                                ''
                                        ),
                                ],
                                {
                                        // eslint-disable-line no-control-regex
                                        type: 'text/plain',
                                }
                        );
                        if (window.navigator.msSaveOrOpenBlob) {
                                window.navigator.msSaveBlob(blob, myFile);
                        } else {
                                const elem = window.document.createElement('a');
                                elem.href = window.URL.createObjectURL(blob);
                                elem.download = myFile;
                                document.body.appendChild(elem);
                                elem.click();
                                document.body.removeChild(elem);
                        }
                }
                term.focus();
        }
        // Set variable to toggle log data from client/server to a varialble
        // for later download
        const toggleLog = () => {
                if (sessionLogEnable === true) {
                        sessionLogEnable = false;
                        loggedData = true;
                        logBtn.innerHTML = "<i class='fas fa-clipboard fa-fw'></i> Start Log";
                        currentDate = new Date();
                        sessionLog = ''
                                .concat(sessionLog, '\r\n\r\nLog End for ')
                                .concat(sessionFooter, ': ')
                                .concat(currentDate.getFullYear(), '/')
                                .concat(currentDate.getMonth() + 1, '/')
                                .concat(currentDate.getDate(), ' @ ')
                                .concat(currentDate.getHours(), ':')
                                .concat(currentDate.getMinutes(), ':')
                                .concat(currentDate.getSeconds(), '\r\n');
                        logDate = currentDate;
                        term.focus();
                        return false;
                }
                sessionLogEnable = true;
                loggedData = true;
                logBtn.innerHTML = "<i class='fas fa-cog fa-spin fa-fw'></i> Stop Log";
                downloadLogBtn.style.color = '#000';
                downloadLogBtn.addEventListener('click', downloadLog);
                currentDate = new Date();
                sessionLog = 'Log Start for '
                        .concat(sessionFooter, ': ')
                        .concat(currentDate.getFullYear(), '/')
                        .concat(currentDate.getMonth() + 1, '/')
                        .concat(currentDate.getDate(), ' @ ')
                        .concat(currentDate.getHours(), ':')
                        .concat(currentDate.getMinutes(), ':')
                        .concat(currentDate.getSeconds(), '\r\n\r\n');
                logDate = currentDate;
                term.focus();
                return false;
        }
        // draw/re-draw menu and reattach listeners
        // when dom is changed, listeners are abandonded
        const drawMenu = () => {
                logBtn.addEventListener('click', toggleLog);
                if (loggedData) {
                        downloadLogBtn.addEventListener('click', downloadLog);
                        downloadLogBtn.style.display = 'block';
                }
        }
        function resizeScreen() {
                fitAddon.fit();
                socket.emit('resize', { cols: term.cols, rows: term.rows });
        }
        window.addEventListener('resize', resizeScreen, false);
        term.onData((data) => {
                socket.emit('data', data);
        });
        socket.on('data', (data) => {
                term.write(data);
                if (sessionLogEnable) {
                        sessionLog += data;
                }
        });
        socket.on('connect', () => {
                socket.emit('geometry', term.cols, term.rows);
        });
        socket.on('setTerminalOpts', (data) => {
                term.options.cursorBlink = data.cursorBlink;
                term.options.scrollback = data.scrollback;
                term.options.tabStopWidth = data.tabStopWidth;
                term.options.bellStyle = data.bellStyle;
        });
        socket.on('title', (data) => {
                if (window.location.pathname.includes('/cloudshell-terminal/')) {
                        document.title = data;
                }
        });
        socket.on('menu', () => {
                drawMenu();
        });
        socket.on('status', (data) => {
                status.innerHTML = data;
        });
        socket.on('ssherror', (data) => {
                status.innerHTML = data;
                status.style.backgroundColor = 'red';
                errorExists = true;
        });
        socket.on('headerBackground', (data) => {
                header.style.backgroundColor = data;
        });
        socket.on('footer', (data) => {
                sessionFooter = data;
                footer.innerHTML = data;
        });
        socket.on('statusBackground', (data) => {
                status.style.backgroundColor = data;
        });
        socket.on('disconnect', (err) => {
                if (!errorExists) {
                        status.style.backgroundColor = 'red';
                        status.innerHTML = 'WEBSOCKET SERVER DISCONNECTED: '.concat(err);
                }
                socket.io.reconnection(false);
        });
        socket.on('error', (err) => {
                if (!errorExists) {
                        status.style.backgroundColor = 'red';
                        status.innerHTML = 'ERROR: '.concat(err);
                }
        });
}

export default CloudshellTerminal;