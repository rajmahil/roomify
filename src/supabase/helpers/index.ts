export const createNewProject = async (images: string[] = []) => {
  const newProjectReq = await fetch("/api/projects/create", {
    method: "POST",
    body: JSON.stringify({ images }),
  });

  if (!newProjectReq.ok) {
    throw new Error("Failed to create project");
  }

  const data = await newProjectReq.json();

  return data;
};
