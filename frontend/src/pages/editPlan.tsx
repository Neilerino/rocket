import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'shad/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'shad/components/ui/dialog';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { CalendarDays, Mountain, Power, Flame, Timer, Edit } from 'lucide-react';
import { useParams } from '@tanstack/react-router';
import { ROUTES } from '@/routing/routeConstants';

const PlanEditor = () => {
  const { planId } = useParams({
    from: `${ROUTES.PLANNING.path}${ROUTES.PLANNING.children.EDIT_PLAN.path}`,
  });

  console.log(planId);

  const [plan, setPlan] = useState({
    id: 1,
    title: 'Bouldering Power Endurance',
    description: 'Focus on sustained climbing with moderate difficulty',
    duration: '8 weeks',
    schedule: '3x per week',
    groupings: ['Monday', 'Wednesday', 'Friday'],
    categories: ['Power Endurance', 'Finger Training', 'Warmup'],
    exercises: [
      {
        id: 1,
        name: '4x4s on V3-V4',
        description: '4 problems, 4 times each with 1 min rest between problems',
        groupings: ['Monday', 'Friday'],
        categories: ['Power Endurance'],
      },
      {
        id: 2,
        name: 'Hangboard Repeaters',
        description: '7/3 repeaters on 20mm edge',
        groupings: ['Wednesday'],
        categories: ['Finger Training'],
      },
    ],
  });

  const [showGroupingDialog, setShowGroupingDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);

  const [newGrouping, setNewGrouping] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    groupings: [],
    categories: [],
  });

  const handleAddGrouping = () => {
    if (newGrouping.trim()) {
      setPlan((prev) => ({
        ...prev,
        groupings: [...prev.groupings, newGrouping.trim()],
      }));
      setNewGrouping('');
      setShowGroupingDialog(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setPlan((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory('');
      setShowCategoryDialog(false);
    }
  };

  const handleAddExercise = () => {
    if (newExercise.name.trim()) {
      setPlan((prev) => ({
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: prev.exercises.length + 1,
            ...newExercise,
          },
        ],
      }));
      setNewExercise({
        name: '',
        description: '',
        groupings: [],
        categories: [],
      });
      setShowExerciseDialog(false);
    }
  };

  const toggleExerciseGrouping = (exerciseId, grouping) => {
    setPlan((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          const groupings = exercise.groupings.includes(grouping)
            ? exercise.groupings.filter((g) => g !== grouping)
            : [...exercise.groupings, grouping];
          return { ...exercise, groupings };
        }
        return exercise;
      }),
    }));
  };

  const toggleExerciseCategory = (exerciseId, category) => {
    setPlan((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          const categories = exercise.categories.includes(category)
            ? exercise.categories.filter((c) => c !== category)
            : [...exercise.categories, category];
          return { ...exercise, categories };
        }
        return exercise;
      }),
    }));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-blue-950 text-white w-full shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)] relative z-10 border-b-2 border-gray-800/50">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Mountain className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">{plan.title}</h1>
              <p className="text-white/80">{plan.description}</p>
            </div>
          </div>
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span>{plan.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              <span>{plan.schedule}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Training Days Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Training Days
            </h2>
            <Dialog open={showGroupingDialog} onOpenChange={setShowGroupingDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Add Day
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Training Day</DialogTitle>
                  <DialogDescription>Add a new training day to your schedule</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Day Name</Label>
                    <Input
                      placeholder="e.g., Monday Power"
                      value={newGrouping}
                      onChange={(e) => setNewGrouping(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowGroupingDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGrouping}>Add Day</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.groupings.map((grouping) => (
              <Card key={grouping} className="relative group hover:shadow-lg transition-all">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {grouping}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 absolute right-4 top-4"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan.exercises
                      .filter((exercise) => exercise.groupings.includes(grouping))
                      .map((exercise) => (
                        <div key={exercise.id} className="p-2 bg-secondary rounded-lg text-sm">
                          {exercise.name}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Exercise Categories Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Power className="w-5 h-5" />
              Training Categories
            </h2>
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Training Category</DialogTitle>
                  <DialogDescription>Create a new category for your exercises</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      placeholder="e.g., Power Endurance"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.categories.map((category) => (
              <div
                key={category}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium flex items-center gap-2 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* Exercises Library */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mountain className="w-5 h-5" />
              Exercise Library
            </h2>
            <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
              <DialogTrigger asChild>
                <Button>Add Exercise</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>Add a new exercise to your training plan</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Exercise Name</Label>
                    <Input
                      placeholder="e.g., 4x4s on V3-V4"
                      value={newExercise.name}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the exercise..."
                      value={newExercise.description}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowExerciseDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExercise}>Add Exercise</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {plan.exercises.map((exercise) => (
              <Card key={exercise.id} className="group hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-start justify-between">
                    <span className="flex items-center gap-2">{exercise.name}</span>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Training Days</Label>
                      <div className="flex flex-wrap gap-1">
                        {plan.groupings.map((grouping) => (
                          <Button
                            key={grouping}
                            variant={
                              exercise.groupings.includes(grouping) ? 'secondary' : 'outline'
                            }
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => toggleExerciseGrouping(exercise.id, grouping)}
                          >
                            {grouping}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Categories</Label>
                      <div className="flex flex-wrap gap-1">
                        {plan.categories.map((category) => (
                          <Button
                            key={category}
                            variant={exercise.categories.includes(category) ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => toggleExerciseCategory(exercise.id, category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanEditor;
