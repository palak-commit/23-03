import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { addLog as addLogToStore, clearLogs } from '../store/globalSlice'
import { useGetTasksQuery, useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../store/apiServices'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const generateId = () => Date.now();
const getTimeString = () => new Date().toLocaleTimeString();

function TaskList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debouncing logic: સર્ચ ઇનપુટમાં ટાઈપ કર્યાના 500ms પછી API કોલ થશે
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // RTK Query hooks - હવે સર્ચ પેરામીટર સાથે
  const { data: tasks = [], isLoading: isFetching } = useGetTasksQuery({ search: debouncedSearch });
  const [addTaskApi] = useAddTaskMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const [deleteTaskApi] = useDeleteTaskMutation();

  const logs = useSelector(state => state.global.logs);

  const [editId, setEditId] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().trim().required('Task title is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      const now = generateId();
      const timeStr = getTimeString();
      
      try {
        if (editId !== null) {
          // Update Logic
          await updateTaskApi({ id: editId, title: values.title }).unwrap();
          setEditId(null);
          toast.success('Task updated successfully! 🔄');
          addLog("Update Task", [
            `Searching for ID ${editId}...`,
            `New value: "${values.title}"`,
            "API Call (PUT) success",
            "RTK Query cache invalidated"
          ], now, timeStr);
        } else {
          // Add Logic
          await addTaskApi({ title: values.title }).unwrap();
          toast.success('New task added! 🚀');
          addLog("Add Task", [
            `New task: "${values.title}"`,
            "API Call (POST) success",
            "RTK Query cache invalidated"
          ], now, timeStr);
        }
        resetForm();
      } catch (err) {
        toast.error(err.data?.message || 'Failed to process task ⚠️');
        console.error('Task action failed:', err);
      }
    },
  });

  // લોગ ઉમેરવા માટેનું ફંક્શન
  const addLog = (action, steps, providedId, providedTime) => {
    const timestamp = providedId || generateId();
    const timeString = providedTime || getTimeString();
    dispatch(addLogToStore({
      id: timestamp,
      action: action,
      steps: steps,
      time: timeString
    }));
  };

  const editTask = (id, title) => { 
    setEditId(id);
    formik.setFieldValue('title', title);
    addLog("Edit Mode", [`ID ${id}  selected`, "Value set in input box", "UI switched to edit mode"], generateId(), getTimeString());
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id || t._id === id);
    const now = generateId();
    const timeStr = getTimeString();

    try {
      await deleteTaskApi(id).unwrap();
      toast.info('Task deleted! 🗑️');
      addLog("Delete Task", [
        `Searching for task "${taskToDelete?.title}"...`,
        "API Call (DELETE) success",
        "RTK Query cache invalidated"
      ], now, timeStr);
      if (editId === id) {
        setEditId(null);
        formik.resetForm();
      }
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete task ⚠️');
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">
      {/* Left Side: Task List UI */}
      <div className="w-full lg:w-1/2 space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            My Task List <span className="text-4xl">📝</span>
          </h1>
          
          <form onSubmit={formik.handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <input 
                type="text" 
                name="title"
                placeholder="Write a task..." 
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formik.touched.title && formik.errors.title 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className={`flex-grow sm:flex-none px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                  editId !== null 
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {editId !== null ? 'Update' : 'Add'}
              </button>
              {editId !== null && (
                <button 
                  type="button" 
                  className="px-6 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                  onClick={() => { setEditId(null); formik.resetForm(); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-xs font-medium mt-1 ml-1">{formik.errors.title}</div>
          )}

          {/* Search Input */}
          <div className="mt-8 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="mt-8">
            {isFetching ? (
              <div className="flex items-center gap-3 text-indigo-500 font-medium animate-pulse">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Loading tasks...
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task._id || task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all group">
                    <span className="text-gray-700 font-medium">{task.title}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                        onClick={() => editTask(task._id || task.id, task.title)}
                        title="Edit Task"
                      >
                        ✏️
                      </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        onClick={() => deleteTask(task._id || task.id)}
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tasks.length === 0 && !isFetching && (
              <div className="text-center py-10 space-y-2">
                <div className="text-4xl">😊</div>
                <p className="text-gray-500 font-medium">No tasks yet. Add a new one!</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold mt-10 hover:bg-black transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>

      {/* Right Side: Flow Visualization */}
      <div className="w-full lg:w-1/2">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl min-h-[400px]">
          <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
            <span className="text-xl font-bold text-white flex items-center gap-2">
              React Process Flow <span className="text-indigo-400">⚡</span>
            </span>
            <button 
              onClick={() => dispatch(clearLogs())}
              className="text-xs font-bold text-indigo-400 border border-indigo-400/30 px-3 py-1.5 rounded-lg hover:bg-indigo-400/10 transition-colors"
            >
              CLEAR LOGS
            </button>
          </div>
          
          <div className="space-y-6">
            {logs.length === 0 ? (
              <p className="text-gray-600 italic text-center py-10">Actions will be logged here in real-time...</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded uppercase tracking-tighter">[{log.time}]</span>
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-wide">{log.action}</span>
                  </div>
                  <div className="space-y-1 ml-2">
                    {log.steps.map((step, index) => (
                      <div key={index} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-indigo-500/50 mt-1">➔</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskList;
