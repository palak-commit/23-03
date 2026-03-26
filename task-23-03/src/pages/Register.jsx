import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../store/apiServices';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function Register() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

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
    onSubmit: async (values) => {
      try {
        await register(values).unwrap();
        toast.success('Registration successful! 🎉 Please login.');
        navigate('/login');
      } catch (err) {
        toast.error(err.data?.message || 'Registration failed ⚠️');
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Create New Account 👤</h2>
      
      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="Enter your name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="e.g. rahul@gmail.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Set a strong password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
              formik.touched.password && formik.errors.password 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-200 focus:border-indigo-500'
            }`}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="text-red-500 text-xs font-medium mt-1">{formik.errors.password}</div>
          ) : null}
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isLoading || formik.isSubmitting}
        >
          {isLoading || formik.isSubmitting ? 'Processing...' : 'Register Now 🚀'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
      </div>
    </div>
  );
}

export default Register;
