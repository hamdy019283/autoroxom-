window.AppState = {
    filters: {
        days: 4,
        units: 18
    },
    activeScheduleIdx: 0,
    filteredSchedules: []
};

window.Toast = function(msg, isError=true) {
    const cont = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderRightColor = isError ? 'var(--accent-danger)' : 'var(--accent-teal)';
    t.innerText = msg;
    cont.appendChild(t);
    setTimeout(() => {
        if(document.body.contains(t)) {
            t.remove();
        }
    }, 3500);
}

const renderTableHeader = () => {
    return `
        <thead>
            <tr>
                <th rowspan="2">الأيام</th>
                <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th>
            </tr>
            <tr>
                <th><span class="th-time">9:00 - 9:45</span></th>
                <th><span class="th-time">9:45 - 10:30</span></th>
                <th><span class="th-time">10:40 - 11:25</span></th>
                <th><span class="th-time">11:25 - 12:10</span></th>
                <th><span class="th-time">12:20 - 1:05</span></th>
                <th><span class="th-time">1:05 - 1:50</span></th>
                <th><span class="th-time">2:00 - 2:45</span></th>
                <th><span class="th-time">2:45 - 3:30</span></th>
            </tr>
        </thead>
    `;
};
window.renderTableHeader = renderTableHeader;
