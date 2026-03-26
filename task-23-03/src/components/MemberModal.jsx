import { useRegisterMutation } from '../store/apiServices';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function MemberModal({ isOpen, onClose }) {
  const [registerMemberApi, { isLoading: isRegistering }] = useRegisterMutation();

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name is too short')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await registerMemberApi(values).unwrap();
        toast.success('Member registered successfully! 🎉');
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err.data?.message || 'Failed to register member ⚠️');
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-indigo-600">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Add New Member 👤</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Name:</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                formik.touched.name && formik.errors.name 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500 text-xs font-medium mt-1">{formik.errors.name}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Email:</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                formik.touched.email && formik.errors.email 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-xs font-medium mt-1">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Password:</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Set password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                formik.touched.password && formik.errors.password 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-xs font-medium mt-1">{formik.errors.password}</div>
            ) : null}
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => { formik.resetForm(); onClose(); }} className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isRegistering || formik.isSubmitting}>
              {isRegistering || formik.isSubmitting ? 'Adding...' : 'Add Member 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberModal;
