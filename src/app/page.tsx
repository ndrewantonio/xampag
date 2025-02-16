import Hero from '@/components/home/hero'

export default function Home() {
  return (
    <>
      <div className="p-8">
        <Hero />

        {/* Create & Join Exam */}
        <section className="flex gap-16 px-16 py-8">
          <div className="h-[300px] flex-1 rounded-[32px] bg-black p-8">
            <div className="flex h-full flex-col justify-between">
              <h1 className="text-center text-3xl font-semibold text-white">
                Create Exam
              </h1>

              <div className="flex justify-end">
                <button className="rounded-full bg-gray-100 p-4 font-medium">
                  Create Now
                </button>
              </div>
            </div>
          </div>

          <div className="bg-green-primary h-[300px] flex-1 rounded-[32px] p-8">
            <div className="flex h-full flex-col justify-between">
              <h1 className="text-center text-3xl font-semibold text-black">
                Join Exam
              </h1>

              <div className="flex justify-end">
                <button className="rounded-full bg-gray-100 p-4 font-medium">
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-gray-primary flex h-[200px] items-center justify-center rounded-t-[64px] p-8 text-center">
        <p className="font-medium">
          &copy; {new Date().getFullYear()} xamPAG. All rights reserved.
        </p>
      </footer>
    </>
  )
}
