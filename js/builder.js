let BuilderState = {
    schedule: {
        'السبت': new Array(9).fill(null),
        'الأحد': new Array(9).fill(null),
        'الإثنين': new Array(9).fill(null),
        'الثلاثاء': new Array(9).fill(null),
        'الأربعاء': new Array(9).fill(null)
    },
    addedIds: new Set(),
    totalUnits: 0
};

const categoryNames = {
    "math3": "رياضيات 3",
    "electives": "مواد اختيارية",
    "logic": "تصميم منطقي 1",
    "electronic_princ": "مبادئ هندسة إلكترونية",
    "electric_princ": "مبادئ هندسة كهربية",
    "comp1": "حاسبات 1",
    "cult2": "مواد ثقافية (2 وحدة)",
    "cult1": "مواد ثقافية (1 وحدة)"
};

function renderSubjectsPool() {
    const pool = document.getElementById('subjects-pool');
    pool.innerHTML = "";
    
    for(const [catKey, catItems] of Object.entries(DB.subjects)) {
        const div = document.createElement('div');
        div.className = 'cat-section';
        div.innerHTML = `<h3 class="cat-title">${categoryNames[catKey] || catKey}</h3>`;
        
        catItems.forEach(item => {
            const isAdded = BuilderState.addedIds.has(item.id);
            const itemDiv = document.createElement('div');
            itemDiv.className = `pool-course ${isAdded ? 'added' : ''}`;
            itemDiv.onclick = () => addCourseToBuilder(item);
            
            // Format time text friendly
            let timeTxt = item.blocks.map(b => `${b[0]} P${b[1]}${b[1]!=b[2]?'-P'+b[2]:''}`).join('، ');
            itemDiv.innerHTML = `
                <div class="pool-info">
                    <h4 style="margin-bottom:0.3rem;">${item.name}</h4>
                    <span style="display:block; color:var(--accent-success); margin-bottom:0.2rem;">${item.doc}</span>
                    <span>${timeTxt}</span>
                </div>
            `;
            div.appendChild(itemDiv);
        });
        
        pool.appendChild(div);
    }
}

function checkBuilderConflict(blocks) {
    for(let b of blocks) {
        let day = b[0], start = b[1], end = b[2];
        for(let p=start; p<=end; p++) {
            if(BuilderState.schedule[day][p] !== null) {
                return true;
            }
        }
    }
    return false;
}

function addCourseToBuilder(course) {
    if(BuilderState.addedIds.has(course.id)) return;
    
    // Check conflicts
    if(checkBuilderConflict(course.blocks)) {
        Toast("يوجد تعارض في المواعيد مع هذه المادة!", true);
        return;
    }
    
    // Add it
    course.blocks.forEach(b => {
        let day = b[0], start = b[1], end = b[2];
        let type = b[3] || "محاضرة";
        for(let p=start; p<=end; p++) {
            BuilderState.schedule[day][p] = { ...course, type };
        }
    });
    
    BuilderState.addedIds.add(course.id);
    BuilderState.totalUnits += course.units;
    
    Toast("تم الإضافة للجدول بنجاح", false);
    
    updateBuilderStats();
    renderBuilderTable();
    renderSubjectsPool();
}

function removeCourseFromBuilder(courseId) {
    if(!BuilderState.addedIds.has(courseId)) return;
    
    // Remove from schedule
    Object.keys(BuilderState.schedule).forEach(day => {
        for(let p=1; p<=8; p++) {
            if(BuilderState.schedule[day][p] && BuilderState.schedule[day][p].id === courseId) {
                BuilderState.schedule[day][p] = null;
            }
        }
    });
    
    // Deduct units
    for(const catItems of Object.values(DB.subjects)) {
        let found = catItems.find(c => c.id === courseId);
        if(found) {
            BuilderState.totalUnits -= found.units;
            break;
        }
    }
    
    BuilderState.addedIds.delete(courseId);
    updateBuilderStats();
    renderBuilderTable();
    renderSubjectsPool();
}

window.clearBuilder = () => {
    Object.keys(BuilderState.schedule).forEach(day => {
        BuilderState.schedule[day].fill(null);
    });
    BuilderState.addedIds.clear();
    BuilderState.totalUnits = 0;
    updateBuilderStats();
    renderBuilderTable();
    renderSubjectsPool();
}

function updateBuilderStats() {
    let daysCount = 0;
    Object.values(BuilderState.schedule).forEach(dayArr => {
        if(dayArr.some(c => c !== null)) daysCount++;
    });
    
    document.getElementById('bld-units').innerText = BuilderState.totalUnits;
    const daysEl = document.getElementById('bld-days');
    daysEl.innerText = daysCount;
    if(daysCount > 4) {
        daysEl.style.color = "var(--accent-danger)";
    } else {
        daysEl.style.color = "var(--accent-teal)";
    }
}

function renderBuilderTable() {
    const table = document.getElementById('builder-table');
    let html = renderTableHeader() + '<tbody>';
    
    const days = Object.keys(BuilderState.schedule);
    
    days.forEach(day => {
        let r = `<tr><td class="day-cell">${day}</td>`;
        
        let pds = BuilderState.schedule[day];
        let compressed = [];
        let cur = null;
        let span = 0;
        
        for (let i = 1; i <= 8; i++) {
            let obj = pds[i];
            if ((cur && obj && cur.id === obj.id && cur.type === obj.type) || (!cur && !obj)) {
                span++;
            } else {
                if(span > 0) compressed.push({data: cur, span});
                cur = obj;
                span = 1;
            }
        }
        if(span > 0) compressed.push({data: cur, span});
        
        compressed.forEach(block => {
            if(!block.data) {
                r += `<td colspan="${block.span}"></td>`;
            } else {
                r += `<td colspan="${block.span}">
                    <div class="course-block" style="padding: 0.5rem; height:100%; position:relative;">
                        <div class="c-name">${block.data.name}</div>
                        <span class="c-type">(${block.data.type})</span>
                        <div class="c-del" onclick="removeCourseFromBuilder('${block.data.id}')">إزالة المادة X</div>
                    </div>
                </td>`;
            }
        });
        r += `</tr>`;
        html += r;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}
