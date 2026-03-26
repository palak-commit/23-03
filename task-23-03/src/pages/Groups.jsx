import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetGroupsQuery, useAddGroupMutation, useUpdateGroupMutation, useDeleteGroupMutation, useSplitExpensesMutation, useGetUsersQuery } from '../store/apiServices';
import { toast } from 'react-toastify';
import MemberModal from '../components/MemberModal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function Groups() {
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { data: groups = [], isLoading: isFetching } = useGetGroupsQuery();
  const { data: dbUsers = [] } = useGetUsersQuery();
  const [addGroupApi] = useAddGroupMutation();
  const [updateGroupApi] = useUpdateGroupMutation();
  const [deleteGroupApi] = useDeleteGroupMutation();
  const [splitExpensesApi] = useSplitExpensesMutation();

  // State for editing
  const [editGroupId, setEditGroupId] = useState(null); 
  
  // States for Split Modal
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [splitType, setSplitType] = useState('equal'); 
  const [manualAmounts, setManualAmounts] = useState({}); 
  
  // States for Add Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Group Form Validation Schema
  const groupValidationSchema = Yup.object({
    name: Yup.string().required('Group name is required'),
    amount: Yup.number().positive('Amount must be positive').required('Total cost is required'),
    members: Yup.array().min(1, 'Select at least one member').required('Members are required'),
  });

  const groupFormik = useFormik({
    initialValues: {
      name: '',
      amount: '',
      members: []
    },
    validationSchema: groupValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editGroupId !== null) {
          // Update Logic
          await updateGroupApi({ id: editGroupId, ...values }).unwrap();
          setEditGroupId(null);
          toast.success('Group updated! 🔄');
        } else {
          // Create Logic
          await addGroupApi(values).unwrap();
          toast.success('Group created! 🚀');
        }
        resetForm();
      } catch (err) {
        toast.error(err.data?.message || 'Failed to save group ⚠️');
      }
    },
  });

  // Helper function to get user name by ID
  const getUserNameById = (userId) => {
    const user = dbUsers.find(u => (u._id || u.id) === userId);
    return user ? user.name : userId;
  };

  const toggleMemberSelection = (userId) => {
    const currentMembers = [...groupFormik.values.members];
    if (currentMembers.includes(userId)) {
      groupFormik.setFieldValue('members', currentMembers.filter(id => id !== userId));
    } else {
      groupFormik.setFieldValue('members', [...currentMembers, userId]);
    }
  };

  const editGroup = (group) => {
    setEditGroupId(group._id || group.id);
    groupFormik.setValues({
      name: group.name,
      amount: group.amount,
      members: group.members.map(m => typeof m === 'object' ? (m._id || m.id) : m)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteGroup = async (id) => {
    if (window.confirm("Do you want to delete this group?")) {
      try {
        await deleteGroupApi(id).unwrap();
        toast.info('Group deleted! 🗑️');
        if (editGroupId === id) {
          setEditGroupId(null);
          groupFormik.resetForm();
        }
      } catch (err) {
        toast.error(err.data?.message || 'Failed to delete group ⚠️');
      }
    }
  };

  const cancelEdit = () => {
    setEditGroupId(null);
    groupFormik.resetForm();
  };

  const openSplitModal = (group) => {
    setActiveGroup(group);
    
    const initialManual = {};
    const hasSplits = group.splits && group.splits.length > 0;
    
    if (hasSplits) {
      setSplitType(group.splits[0].splitType || 'equal');
      group.splits.forEach(split => {
        const userId = split.user?._id || split.user;
        initialManual[userId] = split.amount;
      });
    } else {
      setSplitType('equal');
      const equalAmount = (group.amount / (group.members?.length || 1)).toFixed(2);
      group.members.forEach(member => {
        const memberId = typeof member === 'object' ? (member._id || member.id) : member;
        initialManual[memberId] = equalAmount;
      });
    }
    
    setManualAmounts(initialManual);
    setShowSplitModal(true);
  };

  const handleManualAmountChange = (member, value) => {
    setManualAmounts({
      ...manualAmounts,
      [member]: value
    });
  };

  const handleSaveSplit = async () => {
    let finalSplitData = {};
    
    if (splitType === 'equal') {
      const equalAmount = (activeGroup.amount / activeGroup.members.length).toFixed(2);
      activeGroup.members.forEach(member => {
        const memberId = typeof member === 'object' ? (member._id || member.id) : member;
        finalSplitData[memberId] = equalAmount;
      });
    } else {
      finalSplitData = manualAmounts;
    }

    try {
      // Backend expects splits as an array of objects
      const splitsArray = Object.entries(finalSplitData).map(([memberId, amount]) => ({
        member: memberId,
        amount: Number(amount)
      }));

      await splitExpensesApi({ 
        groupId: activeGroup._id || activeGroup.id, 
        splits: splitsArray, 
        splitType 
      }).unwrap();

      setShowSplitModal(false);
      toast.success('Split details saved! 💸');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save split ⚠️');
    }
  };

  const totalManualAmount = Object.values(manualAmounts).reduce((sum, val) => sum + parseFloat(val || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">
      {/* Add Member Modal */}
      <MemberModal 
        isOpen={showAddMemberModal} 
        onClose={() => setShowAddMemberModal(false)} 
      />

      {/* Split Modal */}
      {showSplitModal && activeGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-hidden flex flex-col max-h-[90vh]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Split Expenses 💸</h2>
            <p className="text-gray-600 mb-6">Group: <span className="font-bold text-indigo-600">{activeGroup.name}</span> | Total: <span className="font-bold text-indigo-600">₹{activeGroup.amount}</span></p>
            
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
              <button 
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${splitType === 'equal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSplitType('equal')}
              >Equal</button>
              <button 
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${splitType === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSplitType('manual')}
              >Manual</button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {activeGroup.members.map((member, idx) => {
                const memberId = typeof member === 'object' ? (member._id || member.id) : member;
                const memberName = getUserNameById(memberId);
                const amounts = Object.values(manualAmounts).map(Number);
                const maxAmount = Math.max(...amounts);
                const isSponsor = splitType === 'manual' && Number(manualAmounts[memberId]) === maxAmount && maxAmount > 0;
                
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{memberName}</span>
                      {isSponsor && <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">SPONSOR</span>}
                    </div>
                    {splitType === 'equal' ? (
                      <span className="font-bold text-gray-900">₹{(activeGroup.amount / activeGroup.members.length).toFixed(2)}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-bold">₹</span>
                        <input 
                          type="number"
                          value={manualAmounts[memberId] || ""}
                          onChange={(e) => handleManualAmountChange(memberId, e.target.value)}
                          className={`w-24 px-3 py-1.5 rounded-lg border-2 outline-none transition-all ${isSponsor ? 'border-yellow-400 font-bold' : 'border-gray-200 focus:border-indigo-500'}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {splitType === 'manual' && (
              <p className={`mt-6 text-right font-bold py-2 px-4 rounded-lg ${totalManualAmount.toFixed(2) === parseFloat(activeGroup.amount).toFixed(2) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                Total: ₹{totalManualAmount.toFixed(2)} / ₹{activeGroup.amount}
              </p>
            )}

            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowSplitModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Close</button>
              <button 
                disabled={splitType === 'manual' && totalManualAmount.toFixed(2) !== parseFloat(activeGroup.amount).toFixed(2)}
                onClick={handleSaveSplit}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full lg:w-1/2 space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{editGroupId ? "Update Group 🔄" : "Create New Group 🚀"}</h2>
          <form onSubmit={groupFormik.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Group Name:</label>
              <input 
                type="text" 
                name="name"
                placeholder="e.g. Goa Trip, Rent, Dinner" 
                value={groupFormik.values.name}
                onChange={groupFormik.handleChange}
                onBlur={groupFormik.handleBlur}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                  groupFormik.touched.name && groupFormik.errors.name 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              {groupFormik.touched.name && groupFormik.errors.name && (
                <div className="text-red-500 text-xs font-medium mt-1">{groupFormik.errors.name}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Total Cost (₹):</label>
              <input 
                type="number" 
                name="amount"
                placeholder="0.00" 
                value={groupFormik.values.amount}
                onChange={groupFormik.handleChange}
                onBlur={groupFormik.handleBlur}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                  groupFormik.touched.amount && groupFormik.errors.amount 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              {groupFormik.touched.amount && groupFormik.errors.amount && (
                <div className="text-red-500 text-xs font-medium mt-1">{groupFormik.errors.amount}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Select Members: 👥</label>
              <div className="flex flex-wrap gap-2">
                {dbUsers.map(user => {
                  const userId = user._id || user.id;
                  const isSelected = groupFormik.values.members.includes(userId);
                  return (
                    <div 
                      key={userId} 
                      className={`px-4 py-2 rounded-full cursor-pointer text-sm font-semibold transition-all border-2 ${
                        isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMemberSelection(userId)}
                    >
                      {user.name}
                    </div>
                  );
                })}
                <div 
                  className="px-4 py-2 rounded-full cursor-pointer text-sm font-bold border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  + Add New
                </div>
              </div>
              {groupFormik.touched.members && groupFormik.errors.members && (
                <div className="text-red-500 text-xs font-medium mt-1">{groupFormik.errors.members}</div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                {editGroupId ? "Update Group" : "Create Group"}
              </button>
              {editGroupId && (
                <button 
                  type="button" 
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold mt-6 hover:bg-black transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>

      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl min-h-[400px]">
          <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
            <span className="text-xl font-bold text-white">Created Groups 📋</span>
          </div>
          
          <div className="space-y-6">
            {isFetching ? (
              <p className="text-indigo-400 animate-pulse font-medium">Loading groups...</p>
            ) : groups.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No groups created yet.</p>
            ) : (
              groups.map(group => (
                <div key={group._id || group.id} className="bg-gray-800/50 rounded-2xl p-6 border-l-4 border-indigo-500 hover:bg-gray-800 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-indigo-400">{group.name}</span>
                        <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded font-bold">₹{group.amount}</span>
                      </div>
                      
                      <p className="text-gray-400 text-sm leading-relaxed">
                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider block mb-1">Members</span>
                        {group.members.map(m => {
                          const memberId = typeof m === 'object' ? (m._id || m.id) : m;
                          return getUserNameById(memberId);
                        }).join(", ")}
                      </p>

                      {group.splits && group.splits.length > 0 ? (
                        <div className="mt-4 p-4 bg-gray-900/50 rounded-xl space-y-2 border border-gray-700/50">
                          <span className="text-green-400 font-bold text-xs uppercase tracking-wider">
                            Split Details ({group.splits[0].splitType === 'equal' ? 'Equal' : 'Manual'}):
                          </span>
                          <div className="space-y-1">
                            {group.splits.map((split) => {
                              const memberName = split.user?.name || getUserNameById(split.user?._id || split.user);
                              const amounts = group.splits.map(s => Number(s.amount));
                              const maxAmount = Math.max(...amounts);
                              const isSponsor = split.splitType === 'manual' && Number(split.amount) === maxAmount && maxAmount > 0;
                              
                              return (
                                <div key={split._id || split.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-300 flex items-center gap-2">
                                    {memberName}
                                    {isSponsor && <span className="bg-yellow-400 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">SPONSOR</span>}
                                  </span>
                                  <span className={isSponsor ? 'text-yellow-400 font-bold' : 'text-gray-400 font-medium'}>₹{split.amount}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-indigo-300/80 text-xs font-bold pt-2">
                          Per person: ₹{(group.amount / (group.members?.length || 1)).toFixed(2)} (Default)
                        </p>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button onClick={() => openSplitModal(group)} className="flex-1 sm:w-20 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-900/20">Split</button>
                      <button onClick={() => editGroup(group)} className="flex-1 sm:w-20 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20">Edit</button>
                      <button onClick={() => deleteGroup(group._id || group.id)} className="flex-1 sm:w-20 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/20">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;
