window.switchView = (viewId) => {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('active');
    });
    if(viewId === 'auto-gen-view') {
        document.getElementById('nav-auto').classList.add('active');
    } else {
        document.getElementById('nav-build').classList.add('active');
    }
};

window.onload = () => {
    // 1. Initialize Auto Generator
    applyFilters();
    
    // 2. Initialize Builder
    renderSubjectsPool();
    clearBuilder();
    
    // Notify
    Toast(`تم تحميل ${DB.metadata.total_schedules} جدول بنجاح`, false);
};

window.exportSchedule = (targetId, prefix) => {
    const el = document.getElementById(targetId);
    html2canvas(el, { backgroundColor: '#f8fafc' }).then(canvas => {
        let a = document.createElement('a');
        a.href = canvas.toDataURL("image/jpeg", 0.9);
        a.download = prefix + "_" + new Date().getTime() + ".jpg";
        a.click();
        Toast("تم حفظ الصورة بنجاح!", false);
    }).catch(err => {
        Toast("حدث خطأ أثناء حفظ الصورة", true);
    });
};
