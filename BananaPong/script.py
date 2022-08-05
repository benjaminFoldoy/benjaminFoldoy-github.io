import matplotlib.pyplot as plt

ts = 0.23
iterations = 50
times = []

for i in range(iterations + 1):
  times.append(i*ts)

listAks = [0]
listVel = [10]
listPos = [0]


def eulerForward(ts, verdi):
  return ts*verdi

def modellIterasjon(input, m, ts):
  a = input/m
  v = eulerForward(ts, input)
  p = eulerForward(ts, v)
  return a, v, p

def modellLoop(initialForce, m, ts, iterations, listAks, listVel, listPos):
  K = 5
  D = 2
  for i in range(iterations):
    a, v, p = modellIterasjon(initialForce - listVel[-1]*D - listPos[-1]*K, m, ts)
    listAks.append(a)
    listVel.append(v)
    listPos.append(p)
m = 10 # feks 10 kg
g = 9.81

modellLoop(m*g, m, ts, iterations, listAks, listVel, listPos)

plt.plot(times, listPos)
plt.show()
