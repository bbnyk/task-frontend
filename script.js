let tasks = [];


// ==============================
// เชื่อม JavaScript กับ HTML
// ==============================

const taskListElement = document.querySelector('#taskList');
const taskForm = document.querySelector('#taskForm');
const taskInput = document.querySelector('#taskInput');
const priorityInput = document.querySelector('#priorityInput');


// ==============================
// CRUD จาก Lab 3
// ==============================

// ค้นหางานจาก ID
const getTaskById = (id) => {
    return tasks.find(task => task.id === id);
};


// หางานด่วนที่ยังไม่เสร็จ
const getUrgentTasks = () => {
    return tasks.filter(
        task => !task.completed && task.priority === "high"
    );
};


// เก็บชื่อของงานทั้งหมด
const taskTitles = tasks.map(task => task.title);


// เพิ่มงานใหม่
const addTask = async (title, priority) => {
    try {
        await fetch('https://cpe-task-api-yerk.onrender.com/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // ต้องบอกเซิร์ฟเวอร์ว่าส่ง JSON ไป
            },
            body: JSON.stringify({ title: title, priority: priority }) //แพ็คของลงกล่อง
        });

        //เมื่อเพิ่ม Backend เสร็จ สั่งดึงข้อมูลล่าสุดมาวาดใหม่
        fetchTasks();
    } catch (error) {
        console.error("เพิ่มงานไม่สำเร็จ:", error);
    }
};


// เปลี่ยนสถานะงาน
const toggleTaskStatus = async (id) => {
    try {
        await fetch(`https://cpe-task-api-yerk.onrender.com/tasks/${id}`, {
            method: 'PUT',
        });
        fetchTasks(); //ดึงข้อมูลใหม่
    } catch (error) {
        console.error("เปลี่ยนสถานะไม่สำเร็จ:", error);
    }
};


// ลบงาน
const deleteTask = async (id) => {
    try {
        await fetch(`https://cpe-task-api-yerk.onrender.com/tasks/${id}`, {
            method: 'DELETE',
        });
        fetchTasks(); //ดึงข้อมูลใหม่
    } catch (error) {
        console.error("ลบงานไม่สำเร็จ:", error);
    }
};

// ใช้คีย์เวิร์ด async หน้าฟังก์ชันเพื่อบอกว่าฟังก์ชันนี้มีการทำงานที่ต้อ "รอ"
const fetchTasks = async () => {
    try {
        // ระหว่างรอข้มูล ให้แสดงข้อความ Loading บนหน้าจอ
        taskListElement.innerHTML = "<h3 style='text-align: content;'>⏳ กำลังดึงข้อมูลจากเซิร์ฟเวอร์...</h3>";

        // ใช้ fetch ไปขอข้อมูล และใส่ await เพื่อบอกให้ "รอจนกว่าข้อมูลจะมาถึง"
        const response = await fetch('https://cpe-task-api-yerk.onrender.com/tasks');

        // แปลงผลลัพธ์ที่ได้ให้กลายเป็นออบเจกต์ JSON
        const data = await response.json();

        // นำข้อมูลที่ได้จากเซิร์ฟเวอร์ มาใส่ในตัวแปร tasks ของเรา
        // เนื่องจาก API ไม่มีฟิลด์ priority เราจึงเติม "low" ให้เป็นค่าเริ่มต้น
        tasks = data.map(item => {
            return {
                id: item._id,
                title: item.title,
                completed: item.completed,
                priority: item.priority || "low"
            };
        });

        // เมื่อข้อมูลพร้อมแล้ว สั่งให้วาดหน้าจอใหม่
        renderTasks();

    } catch (error) {
        // ถ้าเน็ตหลุด หรือ URL ผิด จะวิ่งเข้ามาที่นี่
        console.error("เกิดข้อผิดพลาด:", error);
        taskListElement.innerHTML = "<h3 style='text-align: center; color: red;'>❌ ไม่สามารถดึงข้อมูลได้กรุณาลองใหม่อีกครั้ง</h3>";
    }
};

// ==============================
// ข้อ 3 renderTasks()
// ==============================

const renderTasks = () => {

    // ถ้าไม่มีงาน
    if (tasks.length === 0) {

        taskListElement.innerHTML =
            "<p>🎉 เยี่ยมมาก! ไม่มีงานค้างเลย</p>";

        return;
    }


    // แปลงข้อมูล Array เป็น HTML
    const htmlString = tasks.map(task => {

        const textStyle = task.completed
            ? "text-decoration: line-through; color: gray;"
            : "";

        return `
            <div class="task-card">

                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">

                    <input
                        type="checkbox"

                        onchange="handleToggle('${task.id}')"

                        ${task.completed ? "checked" : ""}
                    >

                    <span style="${textStyle}">

                        ${task.title}

                        <small>
                            (${task.priority})
                        </small>

                    </span>

                </div>


                <button
                    onclick="handleDelete('${task.id}')"

                    style="
                        color: red;
                        cursor: pointer;
                    "
                >

                    ลบ

                </button>

            </div>
        `;

    }).join('');


    taskListElement.innerHTML = htmlString;
};


// ==============================
// ข้อ 4 เพิ่มงานจาก Form
// ==============================

taskForm.addEventListener('submit', (event) => {

    // ไม่ให้หน้าเว็บ Refresh
    event.preventDefault();


    // รับข้อมูลจาก Form
    const newTitle = taskInput.value;
    const newPriority = priorityInput.value;


    // เพิ่มข้อมูลเข้า Array
    addTask(newTitle, newPriority);

    // ล้างช่องกรอก
    taskInput.value = '';
});


// ==============================
// ข้อ 5 Handler
// ==============================

// ลบงาน
const handleDelete = (id) => {

    if (confirm("คุณแน่ใจหรือไม่ที่จะลบงานนี้?")) {

        deleteTask(id);
    }
};


// เปลี่ยนสถานะงาน
const handleToggle = (id) => {

    toggleTaskStatus(id);

};


// ==============================
// แสดงข้อมูลครั้งแรก
// ==============================

console.table(tasks);

console.log(
    "ค้นหางาน ID 2:",
    getTaskById(2)
);

console.log(
    "งานด่วนที่ยังไม่เสร็จ:"
);

console.table(
    getUrgentTasks()
);

// จากเดิมใน Lab 5 สั่ง renderTasks() ทันที
// renderTasks(); <--- ลบคำสั่งนี้ทิ้ง

// เพิ่มคำสั่งนี้ ในการเรียกฟังก์ชันดึงข้อมุลแทน เมื่องดึงข้อมูลเสร็จ จะมีการเรียก renderTasks ในฟังก์ชัน
fetchTasks();